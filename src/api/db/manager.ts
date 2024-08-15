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
    // Get the migrate_index from localStorage
    const storedMigrateIndex = localStorage.getItem("migrate_index");
    let migrateIndex: number;

    if (storedMigrateIndex === null) {
      // If migrate_index doesn't exist in localStorage, migrate all
      await this.db?.exec(migrateArr.join(";\n"));
      migrateIndex = migrateArr.length - 1;
    } else {
      // If migrate_index exists, migrate all subsequent migrations
      migrateIndex = parseInt(storedMigrateIndex, 10);
      const remainingMigrations = migrateArr.slice(migrateIndex + 1);
      if (remainingMigrations.length > 0) {
        await this.db?.exec(remainingMigrations.join(";\n"));
        migrateIndex = migrateArr.length - 1;
      }
    }
    localStorage.setItem("migrate_index", migrateIndex.toString());
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
