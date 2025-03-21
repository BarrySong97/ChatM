import {
  and,
  desc,
  eq,
  gt,
  gte,
  inArray,
  like,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { Transaction, transaction, transactionTags } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditTransaction, TransactionListParams } from "../hooks/transaction";
import Decimal from "decimal.js";
import dayjs from "dayjs";
import type { Page } from "../models/Page";

export class TransactionService {
  // get all
  public static async getAllTransactions(
    book_id: string,
    transactionListParams?: TransactionListParams
  ) {
    const condition = [];
    if (book_id) {
      condition.push(eq(transaction.book_id, book_id));
    }
    if (transactionListParams?.startDate) {
      const startDate = dayjs(
        dayjs(transactionListParams?.startDate).format("YYYY-MM-DD")
      )
        .subtract(1, "day")
        .toDate()
        .getTime();
      condition.push(gt(transaction.transaction_date, startDate));
    }
    if (transactionListParams?.endDate) {
      const endDate = dayjs(
        dayjs(transactionListParams?.endDate).format("YYYY-MM-DD")
      )
        .add(1, "day")
        .toDate()
        .getTime();
      condition.push(lt(transaction.transaction_date, endDate));
    }
    const res = await db.query.transaction.findMany({
      where: and(...condition),
      with: {
        transactionTags: {
          with: {
            tag: true,
          },
        },
      },
    });
    return res;
  }
  // 创建 transaction
  public static async createTransaction(
    book_id: string,
    body: EditTransaction
  ) {
    if (body.destination_account_id === body.source_account_id) {
      throw new Error(
        "destination_account_id and source_account_id cannot be the same"
      );
    }
    const now = Date.now();
    const tags = body.tags;
    delete body.tags;

    const res = await db.transaction(async (trx) => {
      const insertedTransaction = await trx
        .insert(transaction)
        .values({
          id: uuidv4(),
          ...body,
          book_id,
          created_at: now,
          updated_at: now,
        })
        .returning();

      const id = insertedTransaction[0].id;

      if (tags?.length) {
        await trx.insert(transactionTags).values(
          tags.map((tag) => ({
            id: uuidv4(),
            transaction_id: id,
            tag_id: tag,
          }))
        );
      }

      return insertedTransaction[0];
    });

    return res;
  }

  // 创建多个 transactions
  public static async createTransactions(
    body: Array<EditTransaction & { book_id: string }>
  ) {
    const now = Date.now();
    const transactionsToInsert = body.map((item) => {
      const { tags, ...transactionData } = item;
      return {
        id: uuidv4(),
        ...transactionData,
        tags: undefined,
        book_id: item.book_id,
        created_at: now,
        updated_at: now,
      };
    });

    const res = await db.transaction(async (trx) => {
      const insertedTransactions = await trx
        .insert(transaction)
        .values(transactionsToInsert)
        .returning();

      const tagsToInsert = insertedTransactions.flatMap(
        (transaction, index) => {
          const originalItem = body[index];
          return (originalItem.tags || []).map((tag) => ({
            id: uuidv4(),
            transaction_id: transaction.id,
            tag_id: tag,
          }));
        }
      );

      if (tagsToInsert.length > 0) {
        await trx.insert(transactionTags).values(tagsToInsert);
      }

      return insertedTransactions;
    });

    return res;
  }

  // 列出所有 transactions
  public static async listTransactions(
    book_id: string,
    transactionListParams?: TransactionListParams
  ) {
    const page = transactionListParams?.page ?? 1;
    const pageSize = transactionListParams?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;
    const condition = [];
    if (book_id) {
      condition.push(eq(transaction.book_id, book_id));
    }
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
      const startDate = dayjs(
        dayjs(transactionListParams?.startDate).format("YYYY-MM-DD")
      )
        .subtract(1, "day")
        .toDate()
        .getTime();
      condition.push(gt(transaction.transaction_date, startDate));
    }
    if (transactionListParams?.search) {
      condition.push(
        like(transaction.content, `%${transactionListParams?.search}%`)
      );
    }
    if (transactionListParams?.endDate) {
      const endDate = dayjs(
        dayjs(transactionListParams?.endDate).format("YYYY-MM-DD")
      )
        .add(1, "day")
        .toDate()
        .getTime();
      condition.push(lte(transaction.transaction_date, endDate));
    }
    const finalCondition =
      transactionListParams?.filterConditions === "or"
        ? or(...condition)
        : and(...condition);

    const res = await db.query.transaction.findMany({
      columns: {
        id: true,
        content: true,
        created_at: true,
        updated_at: true,
        transaction_date: true,
        type: true,
        source: true,
        source_account_id: true,
        remark: true,
        destination_account_id: true,
        amount: true,
      },
      with: {
        transactionTags: {
          with: {
            tag: true,
          },
        },
      },
      where: and(finalCondition),
      limit: pageSize,
      offset: offset,
      orderBy: [desc(transaction.transaction_date)],
      extras: {
        totalCount: sql<number>`COUNT(*) OVER()`.as("totalCount"),
      },
    });

    const response: Page<Transaction> = {
      list: res.map(({ totalCount, ...item }) => ({
        ...item,
        amount: new Decimal(item.amount ?? 0).dividedBy(100).toNumber(),
      })),
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
    const tags = body.tags;
    delete body.tags;
    const res = await db
      .update(transaction)
      .set({
        ...body,
        updated_at: now,
      })
      .where(eq(transaction.id, id));

    if (tags) {
      await db
        .delete(transactionTags)
        .where(eq(transactionTags.transaction_id, id));
      if (tags.length) {
        await db.insert(transactionTags).values(
          tags.map((tag) => ({
            id: uuidv4(),
            transaction_id: id,
            tag_id: tag,
          }))
        );
      }
    }
    return res;
  }

  // 删除 transaction
  public static async deleteTransaction(id: string) {
    await db.transaction(async (tx) => {
      await tx
        .delete(transactionTags)
        .where(eq(transactionTags.transaction_id, id));
      await tx.delete(transaction).where(eq(transaction.id, id));
    });
  }

  // 删除多个 transaction
  public static async deleteTransactions(ids: string[]) {
    await db.transaction(async (tx) => {
      await tx
        .delete(transactionTags)
        .where(inArray(transactionTags.transaction_id, ids));
      const res = await db
        .delete(transaction)
        .where(inArray(transaction.id, ids));
    });
  }

  // get transaction by startDate and endDate
  public static async getTransactionByMonth(
    monthDate: number,
    book_id: string,
    mode: "month" | "year"
  ) {
    const filterdStartDate =
      mode === "month"
        ? dayjs(monthDate)
            .startOf("month")
            .subtract(1, "day")
            .toDate()
            .getTime()
        : dayjs(monthDate)
            .startOf("year")
            .subtract(1, "day")
            .toDate()
            .getTime();
    const filterdEndDate =
      mode === "month"
        ? dayjs(monthDate).endOf("month").add(1, "day").toDate().getTime()
        : dayjs(monthDate).endOf("year").add(1, "day").toDate().getTime();
    const res = await db.query.transaction.findMany({
      where: and(
        gt(transaction.transaction_date, filterdStartDate),
        lt(transaction.transaction_date, filterdEndDate),
        eq(transaction.book_id, book_id)
      ),
    });
    return res?.map((item) => ({
      ...item,
      amount: new Decimal(item.amount ?? 0).dividedBy(100).toNumber(),
    }));
  }
}
