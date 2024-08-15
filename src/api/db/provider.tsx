import { createContext, useContext, ReactNode } from "react";
import { db } from "./manager";

const DBContext = createContext<typeof db | null>(null);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
};
export const useDb = () => {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};
