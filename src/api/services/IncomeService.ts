import { eq, gte, lte, and, sql, or, gt, lt, SQL } from "drizzle-orm";
import { income, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditIncome } from "../hooks/income";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import dayjs from "dayjs";
// 收入服务
export class IncomeService {
  // get income by id
  public static async getIncomeById(id: string) {
    const res = await db.select().from(income).where(eq(income.id, id));
    return res[0];
  }
  // 创建income
  public static async createIncome(body: EditIncome) {
    // Check if an income with the same name already exists
    const existingIncome = await db
      .select()
      .from(income)
      .where(
        and(eq(income.name, body.name), eq(income.book_id, body.book_id || ""))
      );
    if (existingIncome.length > 0) {
      throw new Error("Income with the same name already exists");
    }
    const res = await db
      .insert(income)
      .values({
        id: uuidv4(),
        ...body,
        book_id: body.book_id ?? "",
      })
      .returning();
    return res[0];
  }

  // list income
  public static async listIncome(book_id?: string) {
    const res = await db
      .select()
      .from(income)
      .where(eq(income.book_id, book_id ?? ""));
    return res;
  }

  public static async getIncomeSumAmount(
    filter?: SideFilter,
    book_id?: string
  ) {
    // Calculate the sum of all income amounts
    const incomeResults = await db.select().from(income);
    const startDate = dayjs(dayjs(filter?.startDate).format("YYYY-MM-DD"))
      .subtract(1, "day")
      .toDate()
      .getTime();
    const endDate = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    // Get all transactions
    const conditions = [];
    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id ?? ""));
    }
    if (filter?.endDate) {
      conditions.push(lt(transaction.transaction_date, endDate));
    }
    if (filter?.startDate) {
      conditions.push(gte(transaction.transaction_date, startDate));
    }
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    let totalIncomeAmount = new Decimal(0);

    const incomesData = new Map<string, string>();
    for (const inc of incomeResults) {
      let incomeAmount = new Decimal(0);

      // Calculate inflows (income to asset)
      const inflows = transactionResults.filter(
        (t) => t.source_account_id === inc.id
      );

      for (const inflow of inflows) {
        incomeAmount = incomeAmount.add(new Decimal(inflow.amount || "0"));
      }

      const outflows = transactionResults.filter(
        (t) => t.destination_account_id === inc.id
      );
      for (const outflow of outflows) {
        incomeAmount = incomeAmount.sub(new Decimal(outflow.amount || "0"));
      }

      totalIncomeAmount = totalIncomeAmount.add(incomeAmount);
      incomesData.set(inc.id, incomeAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalIncomeAmount.div(100).toFixed(2),
      incomeAmounts: incomesData,
    };
  }
  // edit income
  public static async editIncome(id: string, body: Partial<EditIncome>) {
    const res = await db.update(income).set(body).where(eq(income.id, id));
    return res;
  }

  public static async getTrend(book_id: string, filter?: SideFilter) {
    // Get the start and end dates from the filter
    const filterStartDate = dayjs(dayjs(filter?.startDate).format("YYYY-MM-DD"))
      .subtract(1, "day")
      .toDate()
      .getTime();
    const filterEndDate = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();

    // Calculate the number of days between start and end dates
    const startDate = dayjs(filter?.startDate).format("YYYY-MM-DD");
    const endDate = dayjs(filter?.endDate).format("YYYY-MM-DD");
    const daysDifference = dayjs(endDate).diff(startDate, "day");
    const incomeAccounts = await this.listIncome(book_id);
    const trendData = [];
    const conditions = [
      gt(transaction.transaction_date, filterStartDate),
      lt(transaction.transaction_date, filterEndDate),
      eq(transaction.book_id, book_id),
    ];

    if (filter?.accountId) {
      const q = eq(transaction.source_account_id, filter.accountId);
      const q2 = eq(transaction.destination_account_id, filter.accountId);
      const orQ = or(q, q2);
      conditions.push(orQ as SQL<unknown>);
    }
    // First, fetch all transactions within the date range
    const transactions = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    // Create a map to store daily income totals
    const dailyIncomes = new Map<string, Decimal>();
    const inFilteredTransactions = transactions.filter((t) =>
      incomeAccounts.some((i) => i.id === t.source_account_id)
    );
    const outFilteredTransactions = transactions.filter((t) =>
      incomeAccounts.some((i) => i.id === t.destination_account_id)
    );
    // Calculate daily incomes from transactions
    for (const t of inFilteredTransactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyIncomes.set(
        date,
        (dailyIncomes.get(date) || new Decimal(0)).add(amount)
      );
    }
    for (const t of outFilteredTransactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyIncomes.set(
        date,
        (dailyIncomes.get(date) || new Decimal(0)).sub(amount)
      );
    }
    // Generate trend data for each day in the date range
    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = dayjs(startDate).add(i, "day");
      const formattedDate = currentDate.format("YYYY-MM-DD");

      trendData.push({
        amount: (dailyIncomes.get(formattedDate) || new Decimal(0)).toFixed(2),
        label: formattedDate,
      });
    }

    return trendData;
  }

  public static async getIncomeCategory(book_id: string, filter?: SideFilter) {
    // Fetch all income-related transactions within the date range
    const conditions = [eq(transaction.book_id, book_id)];
    if (filter?.startDate) {
      conditions.push(gte(transaction.transaction_date, filter.startDate));
    }
    if (filter?.endDate) {
      conditions.push(lte(transaction.transaction_date, filter.endDate));
    }
    const transactions = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    // Fetch all income accounts
    const incomeAccounts = await db
      .select()
      .from(income)
      .where(eq(income.book_id, book_id));

    // Create a map of income account IDs to names
    const accountNameMap = new Map(incomeAccounts.map((acc) => [acc.id, acc]));
    const categoryTotals = new Map<string, Decimal>();
    transactions.forEach((t) => {
      const amount = new Decimal(t.amount || "0");
      if (
        t.destination_account_id &&
        accountNameMap.has(t.destination_account_id)
      ) {
        // outflow
        categoryTotals.set(
          t.destination_account_id,
          (categoryTotals.get(t.destination_account_id) || new Decimal(0)).sub(
            amount
          )
        );
      }
      if (t.source_account_id && accountNameMap.has(t.source_account_id)) {
        // inflow
        categoryTotals.set(
          t.source_account_id,
          (categoryTotals.get(t.source_account_id) || new Decimal(0)).add(
            amount
          )
        );
      }
    });

    // Convert the grouped data to the required format
    const categoryData = Array.from(
      categoryTotals,
      ([accountId, totalAmount]) => ({
        content: accountNameMap.get(accountId)?.name || "Unknown",
        amount: totalAmount.toNumber(),
        icon: accountNameMap.get(accountId)?.icon || "",
        color: accountNameMap.get(accountId)?.color ?? "",
      })
    );

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => b.amount - a.amount);

    // Create a set of account IDs that have transactions
    const accountsWithTransactions = new Set(
      categoryData.map((item) => item.content)
    );

    // Add income accounts that don't have transactions
    incomeAccounts.forEach((account) => {
      if (!accountsWithTransactions.has(account.name || "")) {
        categoryData.push({
          content: account.name || "",
          amount: 0,
          icon: account.icon || "",
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by amount in descending order again
    categoryData.sort((a, b) => b.amount - a.amount);

    return categoryData.map((item) => ({
      ...item,
      amount: new Decimal(item.amount).div(100).toFixed(2),
    }));
  }

  // delete income
  public static async deleteIncome(id: string) {
    const res = await db.transaction(async (tx) => {
      const res = await tx.delete(income).where(eq(income.id, id));
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
      return res;
    });
    return res;
  }

  // check  name is exist
  public static async checkIncomeName(name: string, book_id: string) {
    const res = await db
      .select()
      .from(income)
      .where(and(eq(income.name, name), eq(income.book_id, book_id)));

    return res.length > 0;
  }
}
