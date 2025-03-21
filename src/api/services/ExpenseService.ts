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
      .where(
        and(
          eq(expense.name, body.name),
          eq(expense.book_id, body.book_id || "")
        )
      );
    if (existingExpense.length > 0) {
      throw new Error("Expense with the same name already exists");
    }
    const res = await db
      .insert(expense)
      .values({
        id: uuidv4(),
        ...body,
        book_id: body.book_id ?? "",
      })
      .returning();
    return res[0];
  }
  // list expense
  public static async listExpense(book_id?: string) {
    const res = await db
      .select()
      .from(expense)
      .where(eq(expense.book_id, book_id ?? ""));
    return res;
  }
  public static async getExpenseSumAmount(
    filter?: SideFilter,
    book_id?: string
  ) {
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
    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    let totalExpenseAmount = new Decimal(0);

    const expensesData = new Map<string, string>();
    for (const exp of expenseResults) {
      let expenseAmount = new Decimal(0);

      // Calculate outflows (asset to expense)
      const inFlow = transactionResults.filter(
        (t) => t.destination_account_id === exp.id
      );
      for (const outflow of inFlow) {
        expenseAmount = expenseAmount.add(new Decimal(outflow.amount || "0"));
      }
      const outFlow = transactionResults.filter(
        (t) => t.source_account_id === exp.id
      );
      for (const outflow of outFlow) {
        expenseAmount = expenseAmount.sub(new Decimal(outflow.amount || "0"));
      }

      totalExpenseAmount = totalExpenseAmount.add(expenseAmount);
      expensesData.set(exp.id, expenseAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalExpenseAmount.div(100).toFixed(2),
      expenseAmounts: expensesData,
    };
  }
  public static async getTrend(book_id: string, filter: Partial<Filter>) {
    // Get the start and end dates from the filter
    const filterStartDate = dayjs(dayjs(filter.startDate).format("YYYY-MM-DD"))
      .subtract(1, "day")
      .toDate()
      .getTime();
    const filterEndDate = dayjs(dayjs(filter.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const expenseAccounts = await this.listExpense(book_id);
    const startDate = dayjs(filter.startDate).format("YYYY-MM-DD");
    const endDate = dayjs(filter.endDate).format("YYYY-MM-DD");
    // Calculate the number of days between start and end dates
    const daysDifference = dayjs(endDate).diff(startDate, "day");
    const trendData = [];
    const conditions = [
      eq(transaction.book_id, book_id),
      gt(transaction.transaction_date, filterStartDate),
      lt(transaction.transaction_date, filterEndDate),
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
    const inFilteredTransactions = transactions.filter((t) =>
      expenseAccounts.some((e) => e.id === t.destination_account_id)
    );
    const outFilteredTransactions = transactions.filter((t) =>
      expenseAccounts.some((e) => e.id === t.source_account_id)
    );
    // Calculate daily expenses from transactions
    for (const t of inFilteredTransactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyExpenses.set(
        date,
        (dailyExpenses.get(date) || new Decimal(0)).add(amount)
      );
    }
    for (const t of outFilteredTransactions) {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || "0").div(100);
      dailyExpenses.set(
        date,
        (dailyExpenses.get(date) || new Decimal(0)).sub(amount)
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
  public static async getExpenseCategory(
    book_id: string,
    filter: Omit<Filter, "category_id">
  ) {
    // Fetch all expense-related transactions within the date range
    const conditions = [];

    const startDate = dayjs(filter.startDate)
      .subtract(1, "day")
      .toDate()
      .getTime();
    const endDate = dayjs(filter.endDate).add(1, "day").toDate().getTime();
    if (filter?.startDate) {
      conditions.push(gte(transaction.transaction_date, startDate));
    }
    if (filter?.endDate) {
      conditions.push(lt(transaction.transaction_date, endDate));
    }
    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id));
    }
    const transactions = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    // Fetch all expense accounts
    const expenseAccounts = await db
      .select()
      .from(expense)
      .where(eq(expense.book_id, book_id));

    // Create a map of expense account IDs to names
    const accountNameMap = new Map(expenseAccounts.map((acc) => [acc.id, acc]));
    const categoryTotals = new Map<string, Decimal>();
    // Group transactions by destination_account_id and sum amounts
    transactions.forEach((t) => {
      const amount = new Decimal(t.amount || "0");
      if (
        t.destination_account_id &&
        accountNameMap.has(t.destination_account_id)
      ) {
        // Inflow
        categoryTotals.set(
          t.destination_account_id,
          (categoryTotals.get(t.destination_account_id) || new Decimal(0)).add(
            amount
          )
        );
      }
      if (t.source_account_id && accountNameMap.has(t.source_account_id)) {
        // Outflow
        categoryTotals.set(
          t.source_account_id,
          (categoryTotals.get(t.source_account_id) || new Decimal(0)).sub(
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
          icon: account.icon ?? "",
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => b.amount - a.amount);

    return categoryData.map((item) => ({
      ...item,
      amount: new Decimal(item.amount).div(100).toFixed(2),
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
  public static async checkExpenseName(name: string, book_id: string) {
    const res = await db
      .select()
      .from(expense)
      .where(and(eq(expense.name, name), eq(expense.book_id, book_id)));
    return res.length > 0;
  }
}
