// db.js
import Dexie, { EntityTable } from "dexie";

interface User {
  id: number;
  avatar: string;
}

const indexDB = new Dexie("flowm") as Dexie & {
  users: EntityTable<User, "id">;
};
indexDB.version(1).stores({
  users: "++id, avatar", // Primary key and indexed props
});
export type { User };
export { indexDB };
