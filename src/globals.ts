import { Book } from "@db/schema";
import { atom } from "jotai";

export const BookAtom = atom<Book | null>(null);
