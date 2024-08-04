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
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  transaction_id: text("transaction_id").notNull().default(""),
  date: int("date").notNull().default(0),
  content: text("content").default(""),
  amount: int("amount").default(0),
  source: text("source").default(""),
  description: text("description").default(""),
  created_at: int("created_at"),
  updated_at: int("updated_at").$onUpdate(() => new Date().getTime()),
});
export type Account = InferSelectModel<typeof accounts>;
export type Transation = InferSelectModel<typeof transactions>;
