import { and, asc, desc, eq, gte, lt, lte, or, SQL, sql } from "drizzle-orm";
import { request as __request } from "../core/request";
import { liability, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditLiability } from "../hooks/liability";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import dayjs from "dayjs";
export class LiabilityService {
  // get liability by id
  public static async getLiabilityById(id: string) {
    const res = await db.select().from(liability).where(eq(liability.id, id));
    return res[0];
  }
  // 创建liability
  public static async createLiability(book_id: string, body: EditLiability) {
    // Check if an  with the same name already exists
    const existingLiability = await db
      .select()
      .from(liability)
      .where(
        and(eq(liability.name, body.name), eq(liability.book_id, book_id))
      );
    if (existingLiability.length > 0) {
      throw new Error("Liability with the same name already exists");
    }
    const res = await db
      .insert(liability)
      .values({
        id: uuidv4(),
        ...body,
        book_id,
      })
      .returning();
    return res[0];
  }

  // list liability
  public static async listLiability(book_id?: string) {
    const res = await db
      .select()
      .from(liability)
      .where(eq(liability.book_id, book_id ?? ""));
    return res;
  }
  public static async getLiabilitySumAmount(
    filter?: SideFilter,
    book_id?: string
  ) {
    // Calculate the sum of all liability amounts
    const liabilityResults = await db.select().from(liability);
    const endDate = dayjs(filter?.endDate).add(1, "day").toDate().getTime();
    // Get all transactions
    const conditions = [];
    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id ?? ""));
    }
    if (filter?.endDate) {
      conditions.push(lt(transaction.transaction_date, endDate));
    }
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    let totalLiabilityAmount = new Decimal(0);

    const liabilitiesData = new Map<string, string>();
    for (const liab of liabilityResults) {
      let liabilityAmount = new Decimal(0);

      // Calculate inflows (asset to liability, liability to liability transfers)
      const inflows = transactionResults.filter(
        (t) =>
          t.source_account_id === liab.id &&
          (t.type === FinancialOperation.Borrow ||
            t.type === FinancialOperation.LoanExpenditure)
      );

      for (const inflow of inflows) {
        liabilityAmount = liabilityAmount.add(
          new Decimal(inflow.amount || "0")
        );
      }

      // Calculate outflows (liability to asset, liability to liability transfers)
      const outflows = transactionResults.filter(
        (t) =>
          t.destination_account_id === liab.id &&
          t.type === FinancialOperation.RepayLoan
      );

      for (const outflow of outflows) {
        liabilityAmount = liabilityAmount.sub(
          new Decimal(outflow.amount || "0")
        );
      }

      totalLiabilityAmount = totalLiabilityAmount.add(liabilityAmount);
      liabilitiesData.set(liab.id, liabilityAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalLiabilityAmount.div(100).toFixed(2),
      liabilityAmounts: liabilitiesData,
    };
  }

  // edit liability
  public static async editLiability(id: string, body: Partial<EditLiability>) {
    const now = Date.now();
    const res = await db
      .update(liability)
      .set({ ...body })

      .where(eq(liability.id, id));
    return res;
  }

  public static async getTrend(book_id: string, filter?: SideFilter) {
    const filterEndDate = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const conditions = [
      eq(transaction.book_id, book_id),
      lt(transaction.transaction_date, filterEndDate),
      or(
        eq(transaction.type, FinancialOperation.Borrow),
        eq(transaction.type, FinancialOperation.LoanExpenditure),
        eq(transaction.type, FinancialOperation.RepayLoan)
      ),
    ];
    if (filter?.accountId) {
      const q = eq(transaction.source_account_id, filter.accountId);
      const q2 = eq(transaction.destination_account_id, filter.accountId);
      const orQ = or(q, q2);
      conditions.push(orQ as SQL<unknown>);
    }
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
        transaction_date: transaction.transaction_date,
        type: transaction.type,
      })
      .from(transaction)
      .where(and(...conditions))
      .orderBy(asc(transaction.transaction_date));

    // Initialize the result array
    const trendData: { label: string; amount: string }[] = [];

    // Create a map to store daily totals
    const dailyTotals = new Map<string, Decimal>();

    // Process transactions
    const liabilityIds = new Set(
      await this.listLiability(book_id).then((liabilities) =>
        liabilities.map((l) => l.id)
      )
    );
    transactions.forEach((t) => {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || 0);

      if (!dailyTotals.has(date)) {
        dailyTotals.set(date, new Decimal(0));
      }

      if (
        t.type === FinancialOperation.Borrow &&
        liabilityIds.has(t.source_account_id ?? "")
      ) {
        dailyTotals.set(date, dailyTotals.get(date)!.plus(amount));
      } else if (
        t.type === FinancialOperation.RepayLoan &&
        liabilityIds.has(t.destination_account_id ?? "")
      ) {
        dailyTotals.set(date, dailyTotals.get(date)!.minus(amount));
      } else if (
        t.type === FinancialOperation.LoanExpenditure &&
        liabilityIds.has(t.source_account_id ?? "")
      ) {
        dailyTotals.set(date, dailyTotals.get(date)!.plus(amount));
      }
    });
    console.log(Array.from(dailyTotals.values()).map((v) => v.toFixed(2)));

    // Fill in the trend data

    let currentDate = dayjs(dayjs(filter?.startDate).format("YYYY-MM-DD"));
    const endDateDayjs = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"));
    let runningTotal = new Decimal(0);

    while (
      currentDate.isBefore(endDateDayjs, "day") ||
      currentDate.isSame(endDateDayjs, "day")
    ) {
      const dateString = currentDate.format("YYYY-MM-DD");
      if (dailyTotals.has(dateString)) {
        runningTotal = runningTotal.add(dailyTotals.get(dateString)!);
      }
      trendData.push({
        label: dateString,
        amount: runningTotal.div(100).toFixed(2),
      });
      currentDate = currentDate.add(1, "day");
    }

    return trendData;
  }

  public static async getCategory(book_id: string, filter?: SideFilter) {
    // Fetch all liability-related transactions within the date range

    const conditions = [
      eq(transaction.book_id, book_id),
      or(
        eq(transaction.type, FinancialOperation.Borrow),
        eq(transaction.type, FinancialOperation.LoanExpenditure),
        eq(transaction.type, FinancialOperation.RepayLoan)
      ),
    ];
    if (filter?.endDate) {
      conditions.push(lte(transaction.transaction_date, filter.endDate));
    }
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
        type: transaction.type,
      })
      .from(transaction)
      .where(and(...conditions));

    // Fetch all liability accounts
    const liabilityAccounts = await db
      .select()
      .from(liability)
      .where(eq(liability.book_id, book_id));

    // Create a map of liability account IDs to names
    const accountNameMap = new Map(
      liabilityAccounts.map((acc) => [acc.id, acc])
    );

    // Group transactions by liability account and sum amounts
    const categoryTotals = transactions.reduce((acc, t) => {
      let accountId;
      let amount;

      if (t.type === FinancialOperation.RepayLoan) {
        accountId = t.destination_account_id;
        amount = new Decimal(t.amount || "0").div(100).negated();
      } else if (t.type === FinancialOperation.Borrow) {
        accountId = t.source_account_id;
        amount = new Decimal(t.amount || "0").div(100);
      } else {
        accountId = t.source_account_id;
        amount = new Decimal(t.amount || "0").div(100);
      }

      if (accountId) {
        acc.set(accountId, (acc.get(accountId) || new Decimal(0)).add(amount));
      }
      return acc;
    }, new Map<string, Decimal>());

    // Convert the grouped data to the required format
    const categoryData = Array.from(
      categoryTotals,
      ([accountId, totalAmount]) => ({
        content: accountNameMap.get(accountId)?.name || "Unknown",
        amount: totalAmount.toNumber(),
        icon: accountNameMap.get(accountId)?.icon ?? "",
        color: accountNameMap.get(accountId)?.color ?? "",
      })
    );

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    // Create a set of account IDs that have transactions
    const accountsWithTransactions = new Set(
      categoryData.map((item) => item.content)
    );

    // Add liability accounts that don't have transactions
    liabilityAccounts.forEach((account) => {
      if (!accountsWithTransactions.has(account.name || "")) {
        categoryData.push({
          content: account.name || "",
          amount: 0,
          icon: account.icon ?? "",
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by absolute amount in descending order
    categoryData.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    return categoryData.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
    }));
  }
  // delete liability
  public static async deleteLiability(id: string) {
    await db.transaction(async (tx) => {
      await tx.delete(liability).where(eq(liability.id, id));
      await tx
        .update(transaction)
        .set({
          destination_account_id: sql`CASE WHEN ${transaction.destination_account_id} = ${id} THEN NULL ELSE ${transaction.destination_account_id} END`,
          source_account_id: sql`CASE WHEN ${transaction.source_account_id} = ${id} THEN NULL ELSE ${transaction.source_account_id} END`,
        })
        .where(
          or(
            eq(transaction.destination_account_id, id),
            eq(transaction.source_account_id, id)
          )
        );
    });
  }

  // check  name is exist
  public static async checkLiabilityName(name: string, book_id: string) {
    const res = await db
      .select()
      .from(liability)
      .where(and(eq(liability.name, name), eq(liability.book_id, book_id)));
    return res.length > 0;
  }
}
