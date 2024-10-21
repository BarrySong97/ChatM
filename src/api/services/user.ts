import { eq } from "drizzle-orm";
import { user } from "@db/schema";
import { db } from "../db/manager";
import { v4 as uuidv4 } from "uuid";
import { EditBook } from "../hooks/book";
export type UserCreate = {
  name: string;
  email?: string;
  avatar?: string;
  isInitialized?: number;
};

export class UserService {
  // find default
  public static async findDefault() {
    const res = await db.select().from(user);
    return res?.[0];
  }
  public static async initUser(body: UserCreate) {
    await db.insert(user).values({
      id: uuidv4(),
      name: body.name,
      isInitialized: 0,
      email: body.email ?? "",
      avatar: body.avatar ?? "",
    });
  }

  // Edit user
  public static async editUser(id: string, body: Partial<UserCreate>) {
    return await db
      .update(user)
      .set({ ...body })
      .where(eq(user.id, id));
  }
}
