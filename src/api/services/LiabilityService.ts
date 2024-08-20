import { and, eq, gte, lte, or } from "drizzle-orm";
import { request as __request } from "../core/request";
import { liability, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditLiability } from "../hooks/liability";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
export class LiabilityService {
  // 创建liability
  public static async createLiability(body: EditLiability) {
    const now = Date.now();
    const res = await db
      .insert(liability)
      .values({
        id: uuidv4(),
        ...body,
      })
      .returning();
    return res[0];
  }

  // list liability
  public static async listLiability() {
    const res = await db.select().from(liability);
    return res;
  }
  public static async getLiabilitySumAmount(filter?: SideFilter) {
    // Calculate the sum of all liability amounts
    const liabilityResults = await db.select().from(liability);

    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter?.endDate
          ? lte(transaction.transaction_date, filter.endDate)
          : undefined
      );

    let totalLiabilityAmount = new Decimal(0);

    const liabilitiesData = new Map<string, string>();
    for (const liab of liabilityResults) {
      let liabilityAmount = new Decimal(liab.initial_balance || "0");

      // Calculate inflows (asset to liability, liability to liability transfers)
      const inflows = transactionResults.filter(
        (t) =>
          t.source_account_id === liab.id &&
          (t.type === FinancialOperation.Borrow ||
            t.type === FinancialOperation.LoanExpenditure)
      );

      for (const inflow of inflows) {
        liabilityAmount = liabilityAmount.add(
          new Decimal(inflow.amount || "0")
        );
      }

      // Calculate outflows (liability to asset, liability to liability transfers)
      const outflows = transactionResults.filter(
        (t) =>
          t.destination_account_id === liab.id &&
          t.type === FinancialOperation.RepayLoan
      );

      for (const outflow of outflows) {
        liabilityAmount = liabilityAmount.sub(
          new Decimal(outflow.amount || "0")
        );
      }

      totalLiabilityAmount = totalLiabilityAmount.add(liabilityAmount);
      liabilitiesData.set(liab.id, liabilityAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalLiabilityAmount.div(100).toFixed(2),
      liabilityAmounts: liabilitiesData,
    };
  }

  // edit liability
  public static async editLiability(id: string, body: Partial<EditLiability>) {
    const now = Date.now();
    const res = await db
      .update(liability)
      .set({ ...body })

      .where(eq(liability.id, id));
    return res;
  }

  public static async getTrend(filter?: SideFilter) {}

  public static async getCategory(filter?: SideFilter) {
    // Fetch all liability-related transactions within the date range
    const transactions = await db
      .select({
        amount: transaction.amount,
        source_account_id: transaction.source_account_id,
        destination_account_id: transaction.destination_account_id,
        type: transaction.type,
      })
      .from(transaction)
      .where(
        and(
          filter?.startDate
            ? gte(transaction.transaction_date, filter.startDate)
            : undefined,
          filter?.endDate
            ? lte(transaction.transaction_date, filter.endDate)
            : undefined,
          or(
            eq(transaction.type, FinancialOperation.Borrow),
            eq(transaction.type, FinancialOperation.LoanExpenditure)
          )
        )
      );

    // Fetch all liability accounts
    const liabilityAccounts = await db.select().from(liability);

    // Create a map of liability account IDs to names
    const accountNameMap = new Map(
      liabilityAccounts.map((acc) => [acc.id, acc])
    );

    // Group transactions by liability account and sum amounts
    const categoryTotals = transactions.reduce((acc, t) => {
      let accountId;
      let amount;

      if (t.type === FinancialOperation.RepayLoan) {
        accountId = t.destination_account_id;
        amount = new Decimal(t.amount || "0").div(100).negated();
      } else {
        accountId = t.source_account_id;
        amount = new Decimal(t.amount || "0").div(100);
      }

      if (accountId) {
        acc.set(accountId, (acc.get(accountId) || new Decimal(0)).add(amount));
      }
      return acc;
    }, new Map<string, Decimal>());

    // Convert the grouped data to the required format
    const categoryData = Array.from(
      categoryTotals,
      ([accountId, totalAmount]) => ({
        content: accountNameMap.get(accountId)?.name || "Unknown",
        amount: totalAmount.toNumber(),
        color: accountNameMap.get(accountId)?.color ?? "",
      })
    );

    // Sort the categoryData by amount in descending order
    categoryData.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    // Create a set of account IDs that have transactions
    const accountsWithTransactions = new Set(
      categoryData.map((item) => item.content)
    );

    // Add liability accounts that don't have transactions
    liabilityAccounts.forEach((account) => {
      if (!accountsWithTransactions.has(account.name || "")) {
        categoryData.push({
          content: account.name || "",
          amount: 0,
          color: account.color ?? "",
        });
      }
    });

    // Sort the categoryData by absolute amount in descending order
    categoryData.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    return categoryData.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
    }));
  }
  // delete liability
  public static async deleteLiability(id: string) {
    const res = await db.delete(liability).where(eq(liability.id, id));
    return res;
  }
}
