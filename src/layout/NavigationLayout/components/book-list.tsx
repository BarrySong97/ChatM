import { useBookService } from "@/api/hooks/book";
import { BookAtom } from "@/globals";
import {
  Button,
  Chip,
  Divider,
  Listbox,
  ListboxItem,
  User,
} from "@nextui-org/react";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import React, { FC } from "react";
import {
  MaterialSymbolsEditDocumentOutlineRounded,
  TablerSettings,
} from "./icon";
import BookModal from "@/components/BookModal";
export interface BookListProps {}
const BookList: FC<BookListProps> = () => {
  const { books, isLoadingBooks, editBook, deleteBook, createBook } =
    useBookService();
  const [book, setBook] = useAtom(BookAtom);
  const selectedBookKeys = book ? [book.id] : [];

  return (
    <div className="w-[280px] py-2">
      <User
        description="BarrySong97@gmail.com"
        classNames={{
          wrapper: "flex-col-reverse",
        }}
        name={
          <Chip
            size="sm"
            color="primary"
            radius="sm"
            variant="flat"
            className="mt-1"
          >
            免费
          </Chip>
        }
        className="cursor-pointer"
        avatarProps={{
          radius: "sm",
          size: "sm",
          src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        }}
      />
      <Divider className="my-2" />
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
          <ListboxItem hideSelectedIcon key={book.id} className="-ml-1">
            <div
              className="flex-row justify-between items-center flex group"
              style={{}}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-sm bg-red-500"></div>
                <div className="text-sm">{book.name}</div>
              </div>
              <div className="hidden group-hover:block group-hover:animate-slide-in-right ">
                <BookModal />
              </div>
            </div>
          </ListboxItem>
        )) ?? []}
      </Listbox>
      <Divider className="my-2" />
      <Button size="sm" className="w-full mt-1" radius="sm" variant="flat">
        创建账本
      </Button>
    </div>
  );
};

export default BookList;
