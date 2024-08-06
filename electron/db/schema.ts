import {
  SQLiteTableWithColumns,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { desc, type InferSelectModel } from "drizzle-orm";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default(""),
  color: text("color").default(""),
  created_at: int("created_at"),
  updated_at: int("updated_at").$onUpdate(() => new Date().getTime()),
});
/**
 * type 0: 收入 1: 支出, 2: 负债
 */
export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default(""),
  color: text("color").default(""),
  type: int("type").notNull().default(0),
  created_at: int("created_at"),
  updated_at: int("updated_at").$onUpdate(() => new Date().getTime()),
});
/**
 * type 0: 收入 1: 支出 2: 负债
 */
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  transaction_id: text("transaction_id").notNull().default(""),
  type: int("type").notNull(),
  date: int("date").notNull().default(0),
  content: text("content").default(""),
  amount: int("amount").default(0),
  source: text("source").default(""),
  description: text("description").default(""),
  category_id: text("category_id").references(() => category.id),
  account_id: text("account_id").references(() => accounts.id),
  created_at: int("created_at"),
  updated_at: int("updated_at").$onUpdate(() => new Date().getTime()),
});
export type Account = InferSelectModel<typeof accounts>;
export type Transaction = InferSelectModel<typeof transactions>;
export type Category = InferSelectModel<typeof category>;
