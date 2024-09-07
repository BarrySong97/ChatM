import { and, eq, inArray } from "drizzle-orm";
import { tags, transactionTags } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditTag } from "../hooks/tag";

export class TagService {
  // 创建tag
  public static async createTag(book_id: string, body: EditTag) {
    const res = await db
      .insert(tags)
      .values({
        id: uuidv4(),
        book_id,
        name: body.name,
      })
      .returning();
    return res[0];
  }

  // list tag
  public static async listTag(book_id: string) {
    const res = await db.select().from(tags).where(eq(tags.book_id, book_id));
    return res;
  }

  // edit tag
  public static async editTag(id: string, body: EditTag) {
    const res = await db
      .update(tags)
      .set({ name: body.name })
      .where(eq(tags.id, id));
    return res;
  }

  // delete tag
  public static async deleteTag(id: string) {
    const res = await db.delete(tags).where(eq(tags.id, id));
    return res;
  }

  // delete tags
  public static async deleteTags(ids: string[]) {
    await db.transaction(async (tx) => {
      await tx
        .delete(transactionTags)
        .where(inArray(transactionTags.tag_id, ids));
      await tx.delete(tags).where(inArray(tags.id, ids));
    });
  }

  // check tag name is exist
  public static async checkTagName(name: string, book_id: string) {
    const res = await db
      .select()
      .from(tags)
      .where(and(eq(tags.name, name), eq(tags.book_id, book_id)));
    return res.length > 0;
  }
}
