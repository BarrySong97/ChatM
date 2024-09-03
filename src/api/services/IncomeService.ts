import { eq, gte, lte, and, sql, or, gt, lt } from "drizzle-orm";
import { income, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditIncome } from "../hooks/income";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import dayjs from "dayjs";
// 收入服务
export class IncomeService {
  // 创建income
  public static async createIncome(body: EditIncome) {
    const res = await db
      .insert(income)
      .values({
        id: uuidv4(),
        name: body.name,
      })
      .returning();
    return res[0];
  }

  // list income
  public static async listIncome() {
    const res = await db.select().from(income);
    return res;
  }

  public static async getIncomeSumAmount(filter?: SideFilter) {
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
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter
          ? and(
              ...(filter.startDate
                ? [gt(transaction.transaction_date, startDate)]
                : []),
              ...(filter.endDate
                ? [lt(transaction.transaction_date, endDate)]
                : [])
            )
          : undefined
      );

    let totalIncomeAmount = new Decimal(0);

    const incomesData = new Map<string, string>();
    for (const inc of incomeResults) {
      let incomeAmount = new Decimal(0);

      // Calculate inflows (income to asset)
      const inflows = transactionResults.filter(
        (t) =>
          t.source_account_id === inc.id && t.type === FinancialOperation.Income
      );

      for (const inflow of inflows) {
        incomeAmount = incomeAmount.add(new Decimal(inflow.amount || "0"));
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
    const res = await db
      .update(income)
      .set({ name: body.name })
      .where(eq(income.id, id));
    return res;
  }

  public static async getTrend(filter?: SideFilter) {
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

    const trendData = [];

    // First, fetch all transactions within the date range
    const transactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          gt(transaction.transaction_date, filterStartDate),
          lt(transaction.transaction_date, filterEndDate),
          eq(transaction.type, FinancialOperation.Income)
        )
      );

    // Create a map to store daily income totals
    const dailyIncomes = new Map<string, Decimal>();

    // Calculate daily incomes from transactions
    for (const t of transactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyIncomes.set(
        date,
        (dailyIncomes.get(date) || new Decimal(0)).add(amount)
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

  public static async getExpenseCategory(filter?: SideFilter) {
    // Fetch all income-related transactions within the date range
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
      })
      .from(transaction)
      .where(
        and(
          filter?.startDate
            ? gte(transaction.transaction_date, filter.startDate)
            : undefined,
          filter?.endDate
            ? lte(transaction.transaction_date, filter.endDate)
            : undefined,
          eq(transaction.type, FinancialOperation.Income)
        )
      );

    // Fetch all income accounts
    const incomeAccounts = await db.select().from(income);

    // Create a map of income account IDs to names
    const accountNameMap = new Map(incomeAccounts.map((acc) => [acc.id, acc]));

    // Group transactions by source_account_id and sum amounts
    const categoryTotals = transactions.reduce((acc, t) => {
      const accountId = t.source_account_id || "";
      const amount = new Decimal(t.amount || "0").div(100);
      acc.set(accountId, (acc.get(accountId) || new Decimal(0)).add(amount));
      return acc;
    }, new Map<string, Decimal>());

    // Convert the grouped data to the required format
    const categoryData = Array.from(
      categoryTotals,
      ([accountId, totalAmount]) => ({
        content: accountNameMap.get(accountId)?.name || "Unknown",
        amount: totalAmount.toNumber(),
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
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by amount in descending order again
    categoryData.sort((a, b) => b.amount - a.amount);

    return categoryData.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
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
}
