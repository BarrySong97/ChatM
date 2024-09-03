/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from "../core/request";
import { assets, transaction, expense, income, liability } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditAsset } from "../hooks/assets";
import { eq, lte, gte, and, min, or, sql, lt } from "drizzle-orm";

import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import { LiabilityService } from "./LiabilityService";
import dayjs from "dayjs";
import { SankeyData } from "../models/Chart";
import { alias } from "drizzle-orm/sqlite-core";
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
    const date = dayjs(filter?.endDate).add(1, "day").toDate().getTime();
    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter
          ? filter.endDate
            ? and(lt(transaction.transaction_date, date))
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
            t.type === FinancialOperation.Borrow ||
            t.type === FinancialOperation.Refund)
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
    const daysDifference = dayjs(today).diff(
      dayjs(earliestDate).format("YYYY-MM-DD"),
      "days"
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

  public static async getCategory(filter?: SideFilter) {
    // Fetch all asset-related transactions within the date range
    const endDate = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
        type: transaction.type,
      })
      .from(transaction)
      .where(
        filter?.endDate ? lt(transaction.transaction_date, endDate) : undefined
      );

    // Fetch all asset accounts
    const assetAccounts = await db.select().from(assets);

    // Create a map of asset account IDs to names and initial balances
    const accountMap = new Map(assetAccounts.map((acc) => [acc.id, acc]));

    // Calculate asset totals
    const assetTotals = new Map<string, Decimal>();

    assetAccounts.forEach((asset) => {
      assetTotals.set(asset.id, new Decimal(asset.initial_balance || "0"));
    });

    transactions.forEach((t) => {
      const amount = new Decimal(t.amount || "0");
      if (
        t.destination_account_id &&
        accountMap.has(t.destination_account_id)
      ) {
        // Inflow
        assetTotals.set(
          t.destination_account_id,
          (assetTotals.get(t.destination_account_id) || new Decimal(0)).add(
            amount
          )
        );
      }
      if (t.source_account_id && accountMap.has(t.source_account_id)) {
        // Outflow
        assetTotals.set(
          t.source_account_id,
          (assetTotals.get(t.source_account_id) || new Decimal(0)).sub(amount)
        );
      }
    });

    // Convert the grouped data to the required format
    const categoryData = Array.from(
      assetTotals,
      ([accountId, totalAmount]) => ({
        content: accountMap.get(accountId)?.name || "Unknown",
        amount: totalAmount.div(100).toNumber(),
        color: accountMap.get(accountId)?.color ?? "",
      })
    );

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => b.amount - a.amount);

    return categoryData.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
    }));
  }
  public static async getTrend(filter: SideFilter) {
    // Get the start and end dates from the filter
    const startDate = filter.startDate;
    const endDate = dayjs(dayjs(filter.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const assets = await this.listAssets();

    const conditions = [
      lt(transaction.transaction_date, endDate),
      or(
        eq(transaction.type, FinancialOperation.Income),
        eq(transaction.type, FinancialOperation.Expenditure),
        eq(transaction.type, FinancialOperation.Transfer),
        eq(transaction.type, FinancialOperation.RepayLoan),
        eq(transaction.type, FinancialOperation.Borrow),
        eq(transaction.type, FinancialOperation.Refund)
      ),
    ];
    if (filter.accountId) {
      conditions.push(
        or(
          eq(transaction.source_account_id, filter.accountId),
          eq(transaction.destination_account_id, filter.accountId)
        )
      );
    }
    // Fetch relevant transactions
    const transactions = await db
      .select({
        amount: transaction.amount,
        type: transaction.type,
        transaction_date: transaction.transaction_date,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
      })
      .from(transaction)
      .where(and(...conditions));

    // Initialize the result array
    const trendData: { label: string; amount: string }[] = [];

    // Create a map to store daily totals
    const dailyTotals = new Map<string, Decimal>();

    // Process transactions
    const assetIds = filter.accountId
      ? new Set([filter.accountId])
      : new Set(assets.map((asset) => asset.id));
    let assetsInitialBalance = 0;
    assets.forEach((asset) => {
      assetsInitialBalance += asset.initial_balance || 0;
    });

    transactions.forEach((t) => {
      const date = dayjs(t.transaction_date).format("YYYY-MM-DD");
      const amount = new Decimal(t.amount || 0);

      if (!dailyTotals.has(date)) {
        dailyTotals.set(date, new Decimal(0));
      }

      if (assetIds.has(t.source_account_id ?? "")) {
        dailyTotals.set(date, dailyTotals.get(date)!.minus(amount));
      }
      if (assetIds.has(t.destination_account_id ?? "")) {
        dailyTotals.set(date, dailyTotals.get(date)!.plus(amount));
      }
    });

    // Fill in the trend data
    let currentDate = dayjs(startDate);
    const endDateDayjs = dayjs(endDate);
    let runningTotal = new Decimal(0);

    while (
      currentDate.isBefore(endDateDayjs, "day") ||
      currentDate.isSame(endDateDayjs, "day")
    ) {
      const dateString = currentDate.format("YYYY-MM-DD");
      if (dailyTotals.has(dateString)) {
        runningTotal = runningTotal.add(dailyTotals.get(dateString)!);
      }
      trendData.push({
        label: dateString,
        amount: runningTotal.add(assetsInitialBalance).div(100).toFixed(2),
      });
      currentDate = currentDate.add(1, "day");
    }

    return trendData;
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
    const res = await db.transaction(async (tx) => {
      const res = await tx.delete(assets).where(eq(assets.id, assetId));
      await tx
        .update(transaction)
        .set({
          destination_account_id: sql`CASE WHEN ${transaction.destination_account_id} = ${assetId} THEN NULL ELSE ${transaction.destination_account_id} END`,
          source_account_id: sql`CASE WHEN ${transaction.source_account_id} = ${assetId} THEN NULL ELSE ${transaction.source_account_id} END`,
        })
        .where(
          or(
            eq(transaction.destination_account_id, assetId),
            eq(transaction.source_account_id, assetId)
          )
        );
      return res;
    });

    return res;
  }

  // get by id
  public static async getAssetById(assetId: string) {
    const res = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .get();
    return res;
  }
  // get sankey data
  public static async getSankeyData(accountId: string) {
    // 1. Query transactions with related account information
    const asset = await this.getAssetById(accountId);
    const sourceTransactions = await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        destination_account_name: sql`COALESCE(${assets.name}, ${expense.name}, ${income.name}, ${liability.name})`,
        destination_account_id: transaction.destination_account_id,
      })
      .from(transaction)
      .leftJoin(assets, eq(transaction.destination_account_id, assets.id))
      .leftJoin(expense, eq(transaction.destination_account_id, expense.id))
      .leftJoin(income, eq(transaction.destination_account_id, income.id))
      .leftJoin(liability, eq(transaction.destination_account_id, liability.id))
      .where(eq(transaction.source_account_id, accountId));

    const destinationTransactions = await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        source_account_name: sql`COALESCE(${assets.name}, ${expense.name}, ${income.name}, ${liability.name})`,
        source_account_id: transaction.source_account_id,
      })
      .from(transaction)
      .leftJoin(assets, eq(transaction.source_account_id, assets.id))
      .leftJoin(expense, eq(transaction.source_account_id, expense.id))
      .leftJoin(income, eq(transaction.source_account_id, income.id))
      .leftJoin(liability, eq(transaction.source_account_id, liability.id))
      .where(eq(transaction.destination_account_id, accountId));
    console.log(destinationTransactions, sourceTransactions);

    // 2. Separate transactions into inflows and outflows

    // 3. Convert to ECharts Sankey chart data format
    const nodes = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];

    nodes.add(asset?.name ?? "");
    // Process inflows
    sourceTransactions.forEach((t) => {
      nodes.add(t.destination_account_name as string);
      links.push({
        source: asset?.name ?? "",
        target: t.destination_account_name as string,
        value: Number(t.amount) / 100, // Assuming amount is in cents
      });
    });

    // Process outflows
    destinationTransactions.forEach((t) => {
      nodes.add(t.source_account_name as string);
      links.push({
        source: t.source_account_name as string,
        target: asset?.name ?? "",
        value: Number(t.amount) / 100, // Assuming amount is in cents
      });
    });

    return {
      nodes: Array.from(nodes).map((name) => ({ name })),
      links,
    } as SankeyData;
  }
}
