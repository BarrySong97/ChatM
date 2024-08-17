import { eq } from "drizzle-orm";
import { request as __request } from "../core/request";
import { income } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditIncome } from "../hooks/income";
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

  // edit income
  public static async editIncome(id: string, body: Partial<EditIncome>) {
    const res = await db
      .update(income)
      .set({ name: body.name })
      .where(eq(income.id, id));
    return res;
  }

  // delete income
  public static async deleteIncome(id: string) {
    const res = await db.delete(income).where(eq(income.id, id));
    return res;
  }
}
