import { Book } from "@db/schema";
import { atom, useAtom } from "jotai";
import { License } from "./api/models/license";

export const BookAtom = atom<Book | null>(null);
export const AppPathAtom = atom("");
export const LicenseAtom = atom<License | null>(null);
export const isSettingOpenAtom = atom(false);
export const AvatarAtom = atom("");
export const ShowExportModalAtom = atom(false);
export const ShowTransactionModalAtom = atom(false);
export const ShowDataImportModalAtom = atom(false);
export const ShowAccountModalAtom = atom(false);
export const ShowSettingModalAtom = atom(false);
export const ShowTagEditModalAtom = atom(false);
export const AccountModalTypeAtom = atom<
  "income" | "expense" | "asset" | "liability"
>("income");
export const ShowCommandModalAtom = atom(false);
export const ShowBatchAddAccountModalAtom = atom(false);
