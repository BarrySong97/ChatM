import { and, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { Transaction, transaction } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditTransaction, TransactionListParams } from "../hooks/transaction";
import { Page } from "../models/Page";

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

  // 创建多个 transactions
  public static async createTransactions(body: EditTransaction[]) {
    const now = Date.now();
    const res = await db
      .insert(transaction)
      .values(
        body.map((item) => ({
          id: uuidv4(),
          ...item,
          created_at: now,
          updated_at: now,
        }))
      )
      .returning();
    return res;
  }

  // 列出所有 transactions
  public static async listTransactions(
    transactionListParams?: TransactionListParams
  ) {
    const page = transactionListParams?.page ?? 1;
    const pageSize = transactionListParams?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;
    const condition = [];
    if (transactionListParams?.accountId) {
      condition.push(
        ...transactionListParams?.accountId.map((id) =>
          or(
            eq(transaction.source_account_id, id),
            eq(transaction.destination_account_id, id)
          )
        )
      );
    }
    if (transactionListParams?.type) {
      condition.push(
        ...transactionListParams?.type.map((type) => eq(transaction.type, type))
      );
    }
    if (transactionListParams?.minAmount) {
      condition.push(gte(transaction.amount, transactionListParams?.minAmount));
    }
    if (transactionListParams?.maxAmount) {
      condition.push(lte(transaction.amount, transactionListParams?.maxAmount));
    }
    if (transactionListParams?.startDate) {
      condition.push(
        gte(transaction.transaction_date, transactionListParams?.startDate)
      );
    }
    if (transactionListParams?.search) {
      condition.push(
        like(transaction.content, `%${transactionListParams?.search}%`)
      );
    }
    if (transactionListParams?.endDate) {
      condition.push(
        lte(transaction.transaction_date, transactionListParams?.endDate)
      );
    }
    const finalCondition =
      transactionListParams?.filterConditions === "or"
        ? or(...condition)
        : and(...condition);
    const res = await db
      .select({
        id: transaction.id,
        content: transaction.content,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        transaction_date: transaction.transaction_date,
        type: transaction.type,
        source: transaction.source,
        source_account_id: transaction.source_account_id,
        remark: transaction.remark,
        destination_account_id: transaction.destination_account_id,
        tags: transaction.tags,
        amount: transaction.amount,
        totalCount: sql<number>`COUNT(*) OVER()`,
      })
      .from(transaction)
      .where(and(finalCondition))
      .limit(pageSize)
      .offset(offset);

    const response: Page<Transaction> = {
      list: res.map(({ totalCount, ...item }) => item),
      totalCount: res[0]?.totalCount ?? 0,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil((res[0]?.totalCount ?? 0) / pageSize),
    };

    return response;
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
