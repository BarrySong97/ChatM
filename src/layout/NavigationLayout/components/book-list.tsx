import { useBookService } from "@/api/hooks/book";
import { BookAtom } from "@/globals";
import { Button, Listbox, ListboxItem } from "@nextui-org/react";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import React, { FC } from "react";
import { MaterialSymbolsEditDocumentOutlineRounded } from "./icon";
export interface BookListProps {}
const BookList: FC<BookListProps> = () => {
  const { books, isLoadingBooks, editBook, deleteBook, createBook } =
    useBookService();
  const [book, setBook] = useAtom(BookAtom);
  const selectedBookKeys = book ? [book.id] : [];

  return (
    <div className="w-[200px]">
      <div className="font-semibold text-default-600 mb-1">账本列表</div>
      <Listbox
        selectedKeys={new Set(selectedBookKeys)}
        selectionMode="single"
        classNames={{
          base: "p-0",
        }}
        variant="flat"
        onSelectionChange={(v) => {
          const id = Array.from(v)[0] as string;
          const book = books?.find((book) => book.id === id);
          if (book) {
            setBook(book);
          }
        }}
      >
        {books?.map((book) => (
          <ListboxItem
            key={book.id}
            className="-ml-1"
            startContent={
              <div className="text-default-500">
                <MaterialSymbolsEditDocumentOutlineRounded />
              </div>
            }
          >
            <div className="flex-row justify-between items-center flex">
              <div>{book.name}</div>
              <div className="text-xs text-default-500">
                {dayjs(book.created_at).format("YYYY-MM-DD ")}
              </div>
            </div>
          </ListboxItem>
        )) ?? []}
      </Listbox>
      {/* <Button size="sm" className="w-full" radius="sm">
        创建账本
      </Button> */}
    </div>
  );
};

export default BookList;
