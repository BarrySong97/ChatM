import { eq } from "drizzle-orm";
import { model } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";

export type EditModel = {
  name: string;
  providerId: string;
};

export class ModelService {
  // 创建 model
  public static async createModel(body: EditModel) {
    const res = await db
      .insert(model)
      .values({
        id: uuidv4(),
        name: body.name,
        providerId: body.providerId,
      })
      .returning();
    return res[0];
  }

  // list models
  public static async listModels(providerId: string) {
    const res = await db
      .select()
      .from(model)
      .where(eq(model.providerId, providerId));
    return res;
  }

  // edit model
  public static async editModel(id: string, body: EditModel) {
    const res = await db
      .update(model)
      .set(body)
      .where(eq(model.id, id))
      .returning();
    return res[0];
  }

  // delete model
  public static async deleteModel(id: string) {
    const res = await db.delete(model).where(eq(model.id, id));
    return res;
  }

  // check model name is exist
  public static async checkModelName(name: string, providerId: string) {
    const res = await db
      .select()
      .from(model)
      .where(eq(model.name, name))
      .where(eq(model.providerId, providerId));
    return res.length > 0;
  }
}
