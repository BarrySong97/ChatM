import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createId } from "@paralleldrive/cuid2";
import * as schema from "../electron/db/schema";

export const database = drizzle(
  async (...args) => {
    try {
      // @ts-expect-error
      const result = await window.ipcRenderer.invoke("db:execute", ...args);
      return { rows: result };
    } catch (e: any) {
      console.error("Error from sqlite proxy server: ", e.response);
      return { rows: [] };
    }
  },
  {
    schema: schema,
  }
);

export async function seed() {
  const initialData = [
    {
      id: createId(),
      title: "微信",
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      color: "#1DAB3B",
    },

    {
      id: createId(),
      title: "支付宝",
      created_at: new Date().getTime(),
      color: "#3876F6",
      updated_at: new Date().getTime(),
    },
  ];
  const data = await database.query.accounts.findMany();

  if (data.length !== 0) return;

  for (const account of initialData) {
    await database.insert(schema.accounts).values(account).execute();
  }
}
