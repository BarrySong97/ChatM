import { eq } from "drizzle-orm";
import { transaction } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditTransaction } from "../hooks/transaction";

export class TransactionService {
  // 创建 transaction
  public static async createTransaction(body: EditTransaction) {
    const now = Date.now();
    const res = await db
      .insert(transaction)
      .values({
        id: uuidv4(),
        ...body,
        created_at: now,
        updated_at: now,
      })
      .returning();
    return res[0];
  }

  // 列出所有 transactions
  public static async listTransactions() {
    const res = await db.select().from(transaction);
    return res;
  }

  // 编辑 transaction
  public static async editTransaction(
    id: string,
    body: Partial<EditTransaction>
  ) {
    const now = Date.now();
    const res = await db
      .update(transaction)
      .set({
        ...body,
        updated_at: now,
      })
      .where(eq(transaction.id, id));
    return res;
  }

  // 删除 transaction
  public static async deleteTransaction(id: string) {
    const res = await db.delete(transaction).where(eq(transaction.id, id));
    return res;
  }
}
