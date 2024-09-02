import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { InferSelectModel, relations } from "drizzle-orm";

export const transaction = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  content: text("content"),
  created_at: integer("created_at"),
  updated_at: integer("updated_at"),
  transaction_date: integer("transaction_date"),
  type: text("type"),
  source: text("source"),
  source_account_id: text("source_account_id"),
  remark: text("remark"),
  destination_account_id: text("destination_account_id"),
  amount: integer("amount"),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name"),
});

export const transactionTags = sqliteTable("transaction_tags", {
  id: text("id").primaryKey(),
  transaction_id: text("transaction_id")
    .notNull()
    .references(() => transaction.id),
  tag_id: text("tag_id")
    .notNull()
    .references(() => tags.id),
});

export const transactionRelations = relations(transaction, ({ many }) => ({
  transactionTags: many(transactionTags),
}));
export const tagRelations = relations(tags, ({ many }) => ({
  transactionTags: many(transactionTags),
}));
export const transactionTagsRelations = relations(
  transactionTags,
  ({ one }) => ({
    transaction: one(transaction, {
      fields: [transactionTags.transaction_id],
      references: [transaction.id],
    }),
    tag: one(tags, {
      fields: [transactionTags.tag_id],
      references: [tags.id],
    }),
  })
);
export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  initial_balance: integer("initial_balance"),
  icon: text("icon"),
});

export const assetsRelations = relations(assets, ({ many }) => ({
  sourceTransactions: many(transaction, { relationName: "sourceAccount" }),
  destinationTransactions: many(transaction, {
    relationName: "destinationAccount",
  }),
}));

export const liability = sqliteTable("liability", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
});

export const expense = sqliteTable("expense", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
});

export const income = sqliteTable("income", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
});

export type Asset = InferSelectModel<typeof assets>;
export type Assets = Asset[];
export type Liability = InferSelectModel<typeof liability>;
export type Liabilities = Liability[];
export type Expense = InferSelectModel<typeof expense>;
export type Expenses = Expense[];
export type Income = InferSelectModel<typeof income>;
export type Incomes = Income[];
export type Transaction = InferSelectModel<typeof transaction>;
export type Transactions = Transaction[];
export type Tag = InferSelectModel<typeof tags>;
export type Tags = Tag[];
