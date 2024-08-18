import { eq, lte, gte, and } from "drizzle-orm";
import { expense, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditExpense } from "../hooks/expense";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
export class ExpenseService {
  // 创建expense
  public static async createExpense(body: EditExpense) {
    const res = await db
      .insert(expense)
      .values({
        id: uuidv4(),
        name: body.name,
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

    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter
          ? and(
              gte(transaction.transaction_date, filter.startDate),
              lte(transaction.transaction_date, filter.endDate)
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

  // edit expense
  public static async editExpense(id: string, body: Partial<EditExpense>) {
    const res = await db
      .update(expense)
      .set({ name: body.name })
      .where(eq(expense.id, id));
    return res;
  }

  // delete expense
  public static async deleteExpense(id: string) {
    const res = await db.delete(expense).where(eq(expense.id, id));
    return res;
  }
}
