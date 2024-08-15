import { request as __request } from "../core/request";
import { income } from "../db";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
// 收入服务
export class IncomeService {
  // 创建income
  public static async createIncome(body: { name: string }) {
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
}
