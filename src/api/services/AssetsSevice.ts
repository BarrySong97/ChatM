/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from "../core/request";
import { assets } from "../db";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditAsset } from "../hooks/assets";
import { eq } from "drizzle-orm";
export class AssetsService {
  // 创建assets
  public static async createAsset(body: EditAsset) {
    const res = await db
      .insert(assets)
      .values({
        id: uuidv4(),
        name: body.name,
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
  public static async editAsset(assetId: string, asset: EditAsset) {
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
