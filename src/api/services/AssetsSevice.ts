/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from "../core/request";
import { assets, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditAsset } from "../hooks/assets";
import { eq, lte, gte, and, min } from "drizzle-orm";

import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import { LiabilityService } from "./LiabilityService";
import dayjs from "dayjs";
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
  public static async getAssetsSumAmount(filter?: SideFilter) {
    // Calculate the sum of all asset amounts
    const assetResults = await db.select().from(assets);

    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter
          ? filter.endDate
            ? and(lte(transaction.transaction_date, filter.endDate))
            : undefined
          : undefined
      );

    let totalAssetAmount = new Decimal(0);

    const assetsData = new Map<string, string>();
    for (const asset of assetResults) {
      let assetAmount = new Decimal(asset.initial_balance || "0");

      // Calculate inflows (income to asset, asset to asset transfers, liability to asset)
      const inflows = transactionResults.filter(
        (t) =>
          t.destination_account_id === asset.id &&
          (t.type === FinancialOperation.Income ||
            t.type === FinancialOperation.Transfer ||
            t.type === FinancialOperation.Borrow)
      );

      for (const inflow of inflows) {
        assetAmount = assetAmount.add(new Decimal(inflow.amount || "0"));
      }

      // Calculate outflows (asset to expense, asset to liability, asset to asset transfers)
      const outflows = transactionResults.filter(
        (t) =>
          t.source_account_id === asset.id &&
          (t.type === FinancialOperation.Expenditure ||
            t.type === FinancialOperation.Transfer ||
            t.type === FinancialOperation.RepayLoan)
      );

      for (const outflow of outflows) {
        assetAmount = assetAmount.sub(new Decimal(outflow.amount || "0"));
      }

      totalAssetAmount = totalAssetAmount.add(assetAmount);
      assetsData.set(asset.id, assetAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalAssetAmount.div(100).toFixed(2),
      assetAmounts: assetsData,
    };
  }
  // 计算networth
  public static async getNetWorth() {
    // Get the earliest transaction date
    const earliestTransactionQuery = await db
      .select({ minDate: min(transaction.transaction_date) })
      .from(transaction);

    const earliestDate = earliestTransactionQuery[0]?.minDate;

    if (!earliestDate) {
      return []; // No transactions found
    }

    // Calculate the number of days from the earliest transaction to now
    const today = new Date();
    const daysDifference = Math.ceil(
      (today.getTime() - new Date(earliestDate).getTime()) / (1000 * 3600 * 24)
    );

    const netWorthData = [];

    for (let i = 0; i <= daysDifference; i++) {
      const currentDate = new Date(earliestDate);
      currentDate.setDate(currentDate.getDate() + i);

      const customFilter = {
        endDate: currentDate.getTime(),
      };

      const { totalAmount } = await this.getAssetsSumAmount(customFilter);
      const { totalAmount: liabilityAmount } =
        await LiabilityService.getLiabilitySumAmount(customFilter);
      const netWorth = new Decimal(totalAmount).sub(
        new Decimal(liabilityAmount)
      );

      netWorthData.push({
        date: dayjs(currentDate).format("YYYY-MM-DD"),
        amount: netWorth,
      });
    }

    return netWorthData;
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
