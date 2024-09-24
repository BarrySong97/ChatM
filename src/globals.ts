import { Book } from "@db/schema";
import { atom } from "jotai";
import { License } from "./api/models/license";

export const BookAtom = atom<Book | null>(null);
export const AppPathAtom = atom("");
export const LicenseAtom = atom<License | null>(null);
export const isSettingOpenAtom = atom(false);
export const AvatarAtom = atom("");
