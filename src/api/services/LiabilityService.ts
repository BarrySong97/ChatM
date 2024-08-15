import { request as __request } from "../core/request";
import { assets, liability } from "../db";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
export class LiabilityService {
  // 创建liability
  public static async createLiability(body: { name: string }) {
    const res = await db
      .insert(liability)
      .values({
        id: uuidv4(),
        name: body.name,
      })
      .returning();
    return res[0];
  }

  // list liability
  public static async listLiability() {
    const res = await db.select().from(liability);
    return res;
  }
}
