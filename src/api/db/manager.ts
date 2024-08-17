import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@db/schema";
export enum FinancialOperation {
  Income = "Income",
  Expenditure = "Expenditure",
  Transfer = "Transfer",
  RepayLoan = "RepayLoan",
  Borrow = "Borrow",
  LoanExpenditure = "LoanExpenditure",
}
export const db = drizzle(
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
