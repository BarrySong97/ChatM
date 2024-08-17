import { eq } from "drizzle-orm";
import { request as __request } from "../core/request";
import { liability, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditLiability } from "../hooks/liability";
import Decimal from "decimal.js";
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
  public static async getLiabilitySumAmount() {
    // Calculate the sum of all liability amounts
    const liabilityResults = await db.select().from(liability);

    // Get all transactions
    const transactionResults = await db.select().from(transaction);

    let totalLiabilityAmount = new Decimal(0);

    const liabilitiesData = new Map<string, string>();
    for (const liab of liabilityResults) {
      let liabilityAmount = new Decimal(liab.initial_balance || "0");

      // Calculate inflows (asset to liability, liability to liability transfers)
      const inflows = transactionResults.filter(
        (t) =>
          t.destination_account_id === liab.id &&
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
          t.source_account_id === liab.id &&
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

  // delete liability
  public static async deleteLiability(id: string) {
    const res = await db.delete(liability).where(eq(liability.id, id));
    return res;
  }
}
