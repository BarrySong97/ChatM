import { eq } from "drizzle-orm";
import { request as __request } from "../core/request";
import { liability } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditLiability } from "../hooks/liability";
export class LiabilityService {
  // 创建liability
  public static async createLiability(body: EditLiability) {
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

  // edit liability
  public static async editLiability(id: string, body: EditLiability) {
    const res = await db
      .update(liability)
      .set({ name: body.name })
      .where(eq(liability.id, id));
    return res;
  }

  // delete liability
  public static async deleteLiability(id: string) {
    const res = await db.delete(liability).where(eq(liability.id, id));
    return res;
  }
}
