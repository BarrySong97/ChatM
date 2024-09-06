import { eq } from "drizzle-orm";
import { book } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditBook } from "../hooks/book";

export class BookService {
  // find default
  public static async findDefault() {
    const res = await db.select().from(book).where(eq(book.isCurrent, 1));
    return res[0];
  }
  // Create book
  public static async createBook(body: EditBook) {
    const res = await db
      .insert(book)
      .values({
        id: uuidv4(),
        ...body,
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
    const res = await db.transaction(async (tx) => {
      if (body.isCurrent) {
        await tx
          .update(book)
          .set({ isCurrent: 0 })
          .where(eq(book.isCurrent, 1));
      }
      const res = await tx
        .update(book)
        .set({ ...body, updated_at: Date.now() })
        .where(eq(book.id, id));
      return res;
    });
    return res;
  }

  // Delete book
  public static async deleteBook(id: string) {
    const item = await db.select().from(book).where(eq(book.id, id));
    if (item?.[0]?.isDefault === 1) {
      throw new Error("默认账本不能删除");
    }
    await db.transaction(async (tx) => {
      await tx.delete(book).where(eq(book.id, id));
      if (item?.[0]?.isCurrent === 1) {
        const defaultBook = await tx
          .select()
          .from(book)
          .where(eq(book.isDefault, 1));
        await tx
          .update(book)
          .set({ isCurrent: 1 })
          .where(eq(book.id, defaultBook[0].id));
      }
    });
  }

  // Check if book name exists
  public static async checkBookName(name: string) {
    const res = await db.select().from(book).where(eq(book.name, name));
    return res.length > 0;
  }
}
