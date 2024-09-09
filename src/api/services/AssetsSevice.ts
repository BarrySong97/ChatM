/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from "../core/request";
import { assets, transaction, expense, income, liability } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditAsset } from "../hooks/assets";
import { eq, and, min, or, sql, lt, gt, SQL } from "drizzle-orm";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
import { LiabilityService } from "./LiabilityService";
import dayjs from "dayjs";
import { Link, SankeyData } from "../models/Chart";
import { ExpenseService } from "./ExpenseService";
import { IncomeService } from "./IncomeService";
export class AssetsService {
  // 创建assets
  public static async createAsset(body: EditAsset) {
    // Check if an asset with the same name already exists
    const existingAsset = await db
      .select()
      .from(assets)
      .where(
        and(eq(assets.name, body.name), eq(assets.book_id, body.book_id || ""))
      )
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
  public static async getAssetsSumAmount(
    filter?: SideFilter,
    book_id?: string
  ) {
    // Calculate the sum of all asset amounts
    const assetResults = await db.select().from(assets);
    const date = dayjs(filter?.endDate).add(1, "day").toDate().getTime();
    // Get all transactions
    const conditions = [];

    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id ?? ""));
    }
    if (filter?.endDate) {
      conditions.push(lt(transaction.transaction_date, date));
    }
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(and(...conditions));

    let totalAssetAmount = new Decimal(0);

    const assetsData = new Map<string, string>();
    for (const asset of assetResults) {
      let assetAmount = new Decimal(asset.initial_balance || "0");

      // Calculate inflows (income to asset, asset to asset transfers, liability to asset)
      const inflows = transactionResults.filter(
        (t) => t.destination_account_id === asset.id
      );

      for (const inflow of inflows) {
        assetAmount = assetAmount.add(new Decimal(inflow.amount || "0"));
      }

      // Calculate outflows (asset to expense, asset to liability, asset to asset transfers)
      const outflows = transactionResults.filter(
        (t) => t.source_account_id === asset.id
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
  public static async getNetWorth(book_id?: string) {
    // Get the earliest transaction date

    const earliestTransactionQuery = await db
      .select({ minDate: min(transaction.transaction_date) })
      .from(transaction)
      .where(book_id ? eq(transaction.book_id, book_id) : undefined);

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

      const { totalAmount } = await this.getAssetsSumAmount(
        customFilter,
        book_id
      );

      const { totalAmount: liabilityAmount } =
        await LiabilityService.getLiabilitySumAmount(customFilter, book_id);

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

  public static async getCategory(book_id: string, filter?: SideFilter) {
    // Fetch all asset-related transactions within the date range
    const endDate = dayjs(dayjs(filter?.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const conditions = [];
    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id));
    }
    if (filter?.endDate) {
      conditions.push(lt(transaction.transaction_date, endDate));
    }
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
        type: transaction.type,
      })
      .from(transaction)
      .where(and(...conditions));

    // Fetch all asset accounts
    const assetAccounts = await db
      .select()
      .from(assets)
      .where(eq(assets.book_id, book_id));

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
        icon: accountMap.get(accountId)?.icon ?? "",
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
  public static async getTrend(book_id: string, filter: SideFilter) {
    // Get the start and end dates from the filter
    const startDate = filter.startDate;

    const endDate = dayjs(dayjs(filter.endDate).format("YYYY-MM-DD"))
      .add(1, "day")
      .toDate()
      .getTime();
    const assets = await this.listAssets(book_id);

    const conditions = [lt(transaction.transaction_date, endDate)];
    if (book_id) {
      conditions.push(eq(transaction.book_id, book_id));
    }
    if (filter.accountId) {
      if (filter?.accountId) {
        const q = eq(transaction.source_account_id, filter.accountId);
        const q2 = eq(transaction.destination_account_id, filter.accountId);
        const orQ = or(q, q2);
        conditions.push(orQ as SQL<unknown>);
      }
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
    if (filter.accountId) {
      assetsInitialBalance =
        assets.find((asset) => asset.id === filter.accountId)
          ?.initial_balance || 0;
    } else {
      assets.forEach((asset) => {
        assetsInitialBalance += asset.initial_balance || 0;
      });
    }

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

    while (currentDate.isBefore(endDateDayjs, "day")) {
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
  public static async listAssets(book_id?: string) {
    const res = await db
      .select()
      .from(assets)
      .where(book_id ? eq(assets.book_id, book_id) : undefined);
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
  public static async getSankeyData(
    accountId: string,
    type: string,
    startDate?: number,
    endDate?: number
  ) {
    const filteredStart = startDate
      ? dayjs(startDate).subtract(1, "day").toDate().getTime()
      : undefined;
    const filteredEnd = endDate
      ? dayjs(endDate).add(1, "day").toDate().getTime()
      : undefined;
    console.log(
      dayjs(startDate).format("YYYY-MM-DD"),
      dayjs(filteredStart).format("YYYY-MM-DD"),
      dayjs(endDate).format("YYYY-MM-DD"),
      dayjs(filteredEnd).format("YYYY-MM-DD")
    );

    // 1. Query transactions with related account information
    let account: { name: string | null } | undefined;
    if (type === "asset") {
      account = await this.getAssetById(accountId);
    } else if (type === "expense") {
      account = await ExpenseService.getExpenseById(accountId);
    } else if (type === "income") {
      account = await IncomeService.getIncomeById(accountId);
    } else {
      account = await LiabilityService.getLiabilityById(accountId);
    }
    const conditions = [];
    if (filteredStart) {
      conditions.push(gt(transaction.transaction_date, filteredStart));
    }
    if (filteredEnd) {
      conditions.push(lt(transaction.transaction_date, filteredEnd));
    }
    const sourceTransactions = await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        destinationType: sql`CASE
          WHEN ${assets.id} IS NOT NULL THEN 'asset'
          WHEN ${expense.id} IS NOT NULL THEN 'expense'
          WHEN ${income.id} IS NOT NULL THEN 'income'
          WHEN ${liability.id} IS NOT NULL THEN 'liability'
          ELSE 'unknown'
        END`,
        destination_account_name: sql`COALESCE(${assets.name}, ${expense.name}, ${income.name}, ${liability.name})`,
        destination_account_id: transaction.destination_account_id,
      })
      .from(transaction)
      .leftJoin(assets, eq(transaction.destination_account_id, assets.id))
      .leftJoin(expense, eq(transaction.destination_account_id, expense.id))
      .leftJoin(income, eq(transaction.destination_account_id, income.id))
      .leftJoin(liability, eq(transaction.destination_account_id, liability.id))
      .where(and(eq(transaction.source_account_id, accountId), ...conditions));

    const destinationTransactions = await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        sourcetype: sql`CASE
          WHEN ${assets.id} IS NOT NULL THEN 'asset'
          WHEN ${expense.id} IS NOT NULL THEN 'expense'
          WHEN ${income.id} IS NOT NULL THEN 'income'
          WHEN ${liability.id} IS NOT NULL THEN 'liability'
          ELSE 'unknown'
        END`,
        source_account_name: sql`COALESCE(${assets.name}, ${expense.name}, ${income.name}, ${liability.name})`,
        source_account_id: transaction.source_account_id,
      })
      .from(transaction)
      .leftJoin(assets, eq(transaction.source_account_id, assets.id))
      .leftJoin(expense, eq(transaction.source_account_id, expense.id))
      .leftJoin(income, eq(transaction.source_account_id, income.id))
      .leftJoin(liability, eq(transaction.source_account_id, liability.id))
      .where(
        and(eq(transaction.destination_account_id, accountId), ...conditions)
      );

    // 2. Separate transactions into inflows and outflows

    // 3. Convert to ECharts Sankey chart data format
    const nodes = new Set<string>();
    const links: Link[] = [];
    const accountNames: { name: string; type: string }[] = [
      {
        name: account?.name ?? "",
        type: type,
      },
    ];

    // Process inflows
    sourceTransactions.forEach((t) => {
      accountNames.push({
        name: t.destination_account_name as string,
        type: t.destinationType as string,
      });
      if (type === "liabilities") {
        nodes.add(account?.name ?? "");
        nodes.add(`${t.destination_account_name}-借款`);
        links.push({
          source: account?.name ?? "",
          target: `${t.destination_account_name}-借款`,
          flow: "in",
          value: Number(t.amount) / 100, // Assuming amount is in cents
        });
      } else if (type === "expense") {
        nodes.add(account?.name ?? "");
        nodes.add(`${t.destination_account_name}-退款`);
        links.push({
          source: account?.name ?? "",
          target: `${t.destination_account_name}-退款`,
          flow: "in",
          value: Number(t.amount) / 100, // Assuming amount is in cents
        });
      } else if (type === "asset") {
        nodes.add(account?.name ?? "");
        nodes.add(`${t.destination_account_name}-流出`);
        links.push({
          source: account?.name ?? "",
          target: `${t.destination_account_name}-流出`,
          flow: "out",
          value: Number(t.amount) / 100, // Assuming amount is in cents
        });
      } else {
        nodes.add(`${account?.name}-流入`);
        nodes.add(`${t.destination_account_name}`);
        links.push({
          source: `${account?.name}-流入`,
          target: `${t.destination_account_name}`,
          value: Number(t.amount) / 100, // Assuming amount is in cents
          flow: "in",
        });
      }
    });

    // Process outflows
    destinationTransactions.forEach((t) => {
      nodes.add(account?.name ?? "");
      accountNames.push({
        name: t.source_account_name as string,
        type: t.sourcetype as string,
      });

      if (type === "liabilities") {
        nodes.add(`${t.source_account_name}-还款`);
        links.push({
          source: `${t.source_account_name}-还款`,
          target: account?.name ?? "",
          flow: "out",
          value: Number(t.amount) / 100, // Assuming amount is in cents
        });
      } else if (type === "expense") {
        nodes.add(`${t.source_account_name}-支出`);
        links.push({
          source: `${t.source_account_name}-支出`,
          target: account?.name ?? "",
          value: Number(t.amount) / 100, // Assuming amount is in cents
          flow: "out",
        });
      } else if (type === "asset") {
        nodes.add(`${t.source_account_name}-流入`);
        links.push({
          source: `${t.source_account_name}-流入`,
          target: account?.name ?? "",
          value: Number(t.amount) / 100, // Assuming amount is in cents
          flow: "in",
        });
      } else {
        nodes.add(`${t.source_account_name}`);
        links.push({
          source: `${t.source_account_name}`,
          target: account?.name ?? "",
          value: Number(t.amount) / 100, // Assuming amount is in cents
          flow: "in",
        });
      }
    });

    return {
      nodes: Array.from(nodes).map((name) => ({
        name,
        type: accountNames.find((account) => name.includes(account.name))?.type,
      })),
      links,
    } as SankeyData;
  }

  // check  name is exist
  public static async checkAssetName(name: string, book_id: string) {
    const conditions = [eq(assets.name, name)];
    if (book_id) {
      conditions.push(eq(assets.book_id, book_id));
    }
    const res = await db
      .select()
      .from(assets)
      .where(and(...conditions));

    return res.length > 0;
  }
}
