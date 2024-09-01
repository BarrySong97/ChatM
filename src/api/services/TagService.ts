import { eq, inArray } from "drizzle-orm";
import { tags } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditTag } from "../hooks/tag";

export class TagService {
  // 创建tag
  public static async createTag(body: EditTag) {
    const res = await db
      .insert(tags)
      .values({
        id: uuidv4(),
        name: body.name,
      })
      .returning();
    return res[0];
  }

  // list tag
  public static async listTag() {
    const res = await db.select().from(tags);
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
    const res = await db.delete(tags).where(inArray(tags.id, ids));
    return res;
  }
}
