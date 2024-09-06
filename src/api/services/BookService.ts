import { eq } from "drizzle-orm";
import { book } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditBook } from "../hooks/book";

export class BookService {
  // find default
  public static async findDefault() {
    const res = await db.select().from(book).where(eq(book.isDefault, 1));
    return res[0];
  }
  // Create book
  public static async createBook(body: EditBook) {
    const res = await db
      .insert(book)
      .values({
        id: uuidv4(),
        name: body.name,
        isDefault: body.isDefault ?? 0,
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .returning();
    return res[0];
  }

  // List books
  public static async listBooks() {
    const res = await db.select().from(book);
    return res;
  }

  // Edit book
  public static async editBook(id: string, body: EditBook) {
    const res = await db
      .update(book)
      .set({ name: body.name, updated_at: Date.now() })
      .where(eq(book.id, id));
    return res;
  }

  // Delete book
  public static async deleteBook(id: string) {
    const item = await db.select().from(book).where(eq(book.id, id));
    if (item?.[0]?.isDefault === 1) {
      throw new Error("默认账本不能删除");
    }
    const res = await db.delete(book).where(eq(book.id, id));
    return res;
  }

  // Check if book name exists
  public static async checkBookName(name: string) {
    const res = await db.select().from(book).where(eq(book.name, name));
    return res.length > 0;
  }
}
