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
  tags: text("tags"),
  amount: text("amount"),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name"),
});

export const transactionRelations = relations(transaction, ({ one }) => ({
  sourceAccount: one(assets, {
    fields: [transaction.source_account_id],
    references: [assets.id],
  }),
  destinationAccount: one(assets, {
    fields: [transaction.destination_account_id],
    references: [assets.id],
  }),
}));

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  initial_balance: text("initial_balance"),
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
  initial_balance: text("initial_balance"),
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
