import { eq, gte, and, sql, or, lt, gt, SQL } from "drizzle-orm";
import { expense, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditExpense, Filter } from "../hooks/expense";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import dayjs from "dayjs";
export class ExpenseService {
  // 创建expense
  public static async createExpense(body: EditExpense) {
    // Check if an expense with the same name already exists
    const existingExpense = await db
      .select()
      .from(expense)
      .where(eq(expense.name, body.name));
    if (existingExpense.length > 0) {
      throw new Error("Expense with the same name already exists");
    }
    const res = await db
      .insert(expense)
      .values({
        id: uuidv4(),
        ...body,
      })
      .returning();
    return res[0];
  }
  // list expense
  public static async listExpense() {
    const res = await db.select().from(expense);
    return res;
  }
  public static async getExpenseSumAmount(filter?: SideFilter) {
    // Calculate the sum of all expense amounts
    const expenseResults = await db.select().from(expense);
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
        filter && filter.startDate && filter.endDate
          ? and(
              gte(transaction.transaction_date, startDate),
              lt(transaction.transaction_date, endDate)
            )
          : undefined
      );

    let totalExpenseAmount = new Decimal(0);

    const expensesData = new Map<string, string>();
    for (const exp of expenseResults) {
      let expenseAmount = new Decimal(0);

      // Calculate outflows (asset to expense)
      const outflows = transactionResults.filter(
        (t) =>
          t.destination_account_id === exp.id &&
          t.type === FinancialOperation.Expenditure
      );
      for (const outflow of outflows) {
        expenseAmount = expenseAmount.add(new Decimal(outflow.amount || "0"));
      }

      totalExpenseAmount = totalExpenseAmount.add(expenseAmount);
      expensesData.set(exp.id, expenseAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalExpenseAmount.div(100).toFixed(2),
      expenseAmounts: expensesData,
    };
  }
  public static async getTrend(filter: Partial<Filter>) {
    // Get the start and end dates from the filter
    const filterStartDate = dayjs(dayjs(filter.startDate).format("YYYY-MM-DD"))
      .subtract(1, "day")
      .toDate()
      .getTime();
    const filterEndDate = dayjs(dayjs(filter.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();

    const startDate = dayjs(filter.startDate).format("YYYY-MM-DD");
    const endDate = dayjs(filter.endDate).format("YYYY-MM-DD");
    // Calculate the number of days between start and end dates
    const daysDifference = dayjs(endDate).diff(startDate, "day");
    const trendData = [];
    const conditions = [
      gt(transaction.transaction_date, filterStartDate),
      lt(transaction.transaction_date, filterEndDate),
      eq(transaction.type, FinancialOperation.Expenditure),
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

    // Create a map to store daily expense totals
    const dailyExpenses = new Map<string, Decimal>();

    // Calculate daily expenses from transactions
    for (const t of transactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyExpenses.set(
        date,
        (dailyExpenses.get(date) || new Decimal(0)).add(amount)
      );
    }

    // Generate trend data for each day in the date range

    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = dayjs(startDate).add(i, "day");
      const formattedDate = currentDate.format("YYYY-MM-DD");

      trendData.push({
        amount: (dailyExpenses.get(formattedDate) || new Decimal(0)).toFixed(2),
        label: formattedDate,
      });
    }

    return trendData;
  }
  public static async getExpenseCategory(filter: Omit<Filter, "category_id">) {
    // Fetch all expense-related transactions within the date range
    const startDate = dayjs(filter.startDate)
      .subtract(1, "day")
      .toDate()
      .getTime();
    const endDate = dayjs(filter.endDate).add(1, "day").toDate().getTime();
    const transactions = await db
      .select({
        amount: transaction.amount,
        destination_account_id: transaction.destination_account_id,
      })
      .from(transaction)
      .where(
        and(
          gt(transaction.transaction_date, startDate),
          lt(transaction.transaction_date, endDate),
          eq(transaction.type, FinancialOperation.Expenditure)
        )
      );

    // Fetch all expense accounts
    const expenseAccounts = await db.select().from(expense);

    // Create a map of expense account IDs to names
    const accountNameMap = new Map(expenseAccounts.map((acc) => [acc.id, acc]));

    // Group transactions by destination_account_id and sum amounts
    const categoryTotals = transactions.reduce((acc, t) => {
      const accountId = t.destination_account_id || "";
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
        icon: accountNameMap.get(accountId)?.icon ?? "",
        color: accountNameMap.get(accountId)?.color ?? "",
      })
    );

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => b.amount - a.amount);

    // Create a set of account IDs that have transactions
    const accountsWithTransactions = new Set(
      categoryData.map((item) => item.content)
    );

    // Add expense accounts that don't have transactions
    expenseAccounts.forEach((account) => {
      if (!accountsWithTransactions.has(account.name || "")) {
        categoryData.push({
          content: account.name || "",
          amount: 0,
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => b.amount - a.amount);

    return categoryData.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
    }));
  }
  // edit expense
  public static async editExpense(id: string, body: Partial<EditExpense>) {
    const res = await db
      .update(expense)
      .set({ ...body })
      .where(eq(expense.id, id));
    return res;
  }

  // delete expense
  public static async deleteExpense(id: string) {
    const res = await db.transaction(async (tx) => {
      const res = await tx.delete(expense).where(eq(expense.id, id));
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
  // get expense by id
  public static async getExpenseById(id: string) {
    const res = await db.select().from(expense).where(eq(expense.id, id));
    return res[0];
  }

  // check  name is exist
  public static async checkExpenseName(name: string) {
    const res = await db.select().from(expense).where(eq(expense.name, name));
    return res.length > 0;
  }
}
