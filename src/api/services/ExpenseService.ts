import { eq } from "drizzle-orm";
import { request as __request } from "../core/request";
import { expense } from "../db";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditExpense } from "../hooks/expense";
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

  // edit expense
  public static async editExpense(id: string, body: EditExpense) {
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
