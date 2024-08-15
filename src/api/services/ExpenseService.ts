import { request as __request } from "../core/request";
import { expense } from "../db";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
export class ExpenseService {
  // 创建expense
  public static async createExpense(body: { name: string }) {
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
}
