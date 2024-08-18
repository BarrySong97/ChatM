import { eq, gte, lte, and } from "drizzle-orm";
import { income, transaction } from "@db/schema";
import { db, FinancialOperation } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditIncome } from "../hooks/income";
import Decimal from "decimal.js";
import { SideFilter } from "../hooks/side";
// 收入服务
export class IncomeService {
  // 创建income
  public static async createIncome(body: EditIncome) {
    const res = await db
      .insert(income)
      .values({
        id: uuidv4(),
        name: body.name,
      })
      .returning();
    return res[0];
  }

  // list income
  public static async listIncome() {
    const res = await db.select().from(income);
    return res;
  }

  public static async getIncomeSumAmount(filter?: SideFilter) {
    // Calculate the sum of all income amounts
    const incomeResults = await db.select().from(income);

    // Get all transactions
    const transactionResults = await db
      .select()
      .from(transaction)
      .where(
        filter
          ? and(
              gte(transaction.transaction_date, filter.startDate),
              lte(transaction.transaction_date, filter.endDate)
            )
          : undefined
      );

    let totalIncomeAmount = new Decimal(0);

    const incomesData = new Map<string, string>();
    for (const inc of incomeResults) {
      let incomeAmount = new Decimal(0);

      // Calculate inflows (income to asset)
      const inflows = transactionResults.filter(
        (t) =>
          t.source_account_id === inc.id && t.type === FinancialOperation.Income
      );

      for (const inflow of inflows) {
        incomeAmount = incomeAmount.add(new Decimal(inflow.amount || "0"));
      }

      totalIncomeAmount = totalIncomeAmount.add(incomeAmount);
      incomesData.set(inc.id, incomeAmount.div(100).toFixed(2));
    }

    return {
      totalAmount: totalIncomeAmount.div(100).toFixed(2),
      incomeAmounts: incomesData,
    };
  }
  // edit income
  public static async editIncome(id: string, body: Partial<EditIncome>) {
    const res = await db
      .update(income)
      .set({ name: body.name })
      .where(eq(income.id, id));
    return res;
  }

  // delete income
  public static async deleteIncome(id: string) {
    const res = await db.delete(income).where(eq(income.id, id));
    return res;
  }
}
