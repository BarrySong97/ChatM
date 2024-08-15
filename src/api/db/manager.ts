import { PGlite } from "@electric-sql/pglite";
import { migrateArr } from "./migrate";
import { drizzle } from "drizzle-orm/pglite";

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: PGlite | null = null;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initializeDatabase(): Promise<void> {
    if (!this.db) {
      this.db = new PGlite("idb://ChatM");
      await this.migrate();
    }
  }
  public async migrate(): Promise<void> {
    const lastMigration = migrateArr.pop();
    if (this.db) {
      const result = await this.db.exec(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'transaction'"
      );
      const count = result[0].rows[0].count;

      if (count === 0) {
        await this.db?.exec(migrateArr.join(";\n"));
      } else {
        if (lastMigration) {
          await this.db?.exec(lastMigration);
        }
      }
    }
  }

  public getDatabase(): PGlite {
    if (!this.db) {
      throw new Error(
        "Database has not been initialized. Call initializeDatabase() first."
      );
    }
    return this.db;
  }

  private drizzleInstance: ReturnType<typeof drizzle> | null = null;

  public getDrizzle() {
    if (!this.db) {
      throw new Error(
        "Database has not been initialized. Call initializeDatabase() first."
      );
    }
    if (!this.drizzleInstance) {
      this.drizzleInstance = drizzle(this.db);
    }
    return this.drizzleInstance;
  }
}

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getDrizzle();

export { db };
