import { eq } from "drizzle-orm";
import { provider } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";

export type EditProvider = {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
};

export class ProviderService {
  // 创建 provider
  public static async createProvider(body: EditProvider) {
    const res = await db
      .insert(provider)
      .values({
        id: uuidv4(),
        name: body.name,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        defaultModel: body.defaultModel,
      })
      .returning();
    return res[0];
  }

  // list providers
  public static async listProviders() {
    const res = await db.select().from(provider);
    return res;
  }

  // edit provider
  public static async editProvider(id: string, body: EditProvider) {
    const res = await db
      .update(provider)
      .set(body)
      .where(eq(provider.id, id))
      .returning();
    return res[0];
  }

  // delete provider
  public static async deleteProvider(id: string) {
    const res = await db.delete(provider).where(eq(provider.id, id));
    return res;
  }

  // check provider name is exist
  public static async checkProviderName(name: string) {
    const res = await db.select().from(provider).where(eq(provider.name, name));
    return res.length > 0;
  }
}
