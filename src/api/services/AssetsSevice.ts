/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from "../core/request";
import { assets } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditAsset } from "../hooks/assets";
import { eq } from "drizzle-orm";
export class AssetsService {
  // 创建assets
  public static async createAsset(body: EditAsset) {
    // Check if an asset with the same name already exists
    const existingAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.name, body.name))
      .limit(1);

    if (existingAsset.length > 0) {
      throw new Error("An asset with this name already exists");
    }
    const res = await db
      .insert(assets)
      .values({
        id: uuidv4(),
        ...body,
      })
      .returning();

    return res[0];
  }
  // list assets
  public static async listAssets() {
    const res = await db.select().from(assets);
    return res;
  }

  // edit asset
  public static async editAsset(assetId: string, asset: Partial<EditAsset>) {
    const res = await db
      .update(assets)
      .set(asset)
      .where(eq(assets.id, assetId));
    return res;
  }

  // delete asset
  public static async deleteAsset(assetId: string) {
    const res = await db.delete(assets).where(eq(assets.id, assetId));
    return res;
  }
}
