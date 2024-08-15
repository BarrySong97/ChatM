import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  name: text("name"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
  color: text("color"),
  icon: text("icon"),
  type: varchar("type", { length: 255 }),
  source: text("source"),
  source_account_id: uuid("source_account_id"),
  destination_account_id: uuid("destination_account_id"),
  amount: integer("amount"),
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

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  tags: text("tags").array(),
});

export const assetsRelations = relations(assets, ({ many }) => ({
  sourceTransactions: many(transaction, { relationName: "sourceAccount" }),
  destinationTransactions: many(transaction, {
    relationName: "destinationAccount",
  }),
}));

export const liability = pgTable("liability", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  tags: text("tags").array(),
});

export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  tags: text("tags").array(),
});

export const income = pgTable("income", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  tags: text("tags").array(),
});
import { InferSelectModel } from "drizzle-orm";

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
