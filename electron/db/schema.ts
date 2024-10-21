import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { InferSelectModel, relations } from "drizzle-orm";
export const book = sqliteTable("book", {
  id: text("id").primaryKey(),
  name: text("name"),
  icon: text("icon"),
  isCurrent: integer("is_current"),
  isDefault: integer("is_default"),
  isInitialized: integer("is_initialized"),
  currency: text("currency").default("CNY"),
  created_at: integer("created_at"),
  updated_at: integer("updated_at"),
});
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  avatar: text("avatar"),
  email: text("email"),
  isInitialized: integer("is_initialized"),
  created_at: integer("created_at"),
});

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
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name"),
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
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

export const transactionRelations = relations(transaction, ({ many, one }) => ({
  transactionTags: many(transactionTags),
  book: one(book, {
    fields: [transaction.book_id],
    references: [book.id],
  }),
}));
export const tagRelations = relations(tags, ({ many, one }) => ({
  transactionTags: many(transactionTags),
  book: one(book, {
    fields: [tags.book_id],
    references: [book.id],
  }),
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
  type: integer("type"),
  initial_balance: integer("initial_balance"),
  icon: text("icon"),
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
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
  initial_balance: integer("initial_balance").default(0),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
});

export const expense = sqliteTable("expense", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
});

export const income = sqliteTable("income", {
  id: text("id").primaryKey(),
  created_at: integer("created_at"),
  name: text("name"),
  color: text("color"),
  icon: text("icon"),
  book_id: text("book_id")
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
});
export type User = InferSelectModel<typeof user>;
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
export type Book = InferSelectModel<typeof book>;
export type Books = Book[];

export const provider = sqliteTable("provider", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key"),
  baseUrl: text("base_url"),
  is_default: integer("is_default"),
  defaultModel: text("default_model"), // Add this line
});

export const model = sqliteTable("model", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  providerId: text("provider_id")
    .notNull()
    .references(() => provider.id, { onDelete: "cascade" }),
});

export const providerRelations = relations(provider, ({ many }) => ({
  models: many(model),
}));

export const modelRelations = relations(model, ({ one }) => ({
  provider: one(provider, {
    fields: [model.providerId],
    references: [provider.id],
  }),
}));

export type Provider = InferSelectModel<typeof provider>;
export type Providers = Provider[];
export type Model = InferSelectModel<typeof model>;
export type Models = Model[];
