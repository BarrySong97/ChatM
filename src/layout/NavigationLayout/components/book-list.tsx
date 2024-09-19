import { useBookService } from "@/api/hooks/book";
import { AppPathAtom, BookAtom } from "@/globals";
import {
  Button,
  Chip,
  cn,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { useAtom } from "jotai";
import { FC, useState } from "react";
import BookModal from "@/components/BookModal";
import AccountIconRender from "@/components/AccountIconRender";
import { BookService } from "@/api/services/BookService";
import { useModal } from "@/components/GlobalConfirmModal";
import { Book } from "@db/schema";
import { message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { IonMdMore } from "@/components/ExpandTreeMenu/icon";
import BookItem from "./BookItem"; // Add this import

export interface BookListProps {
  onClose: () => void;
  onShowBookModal: (book?: Book) => void;
}
const BookList: FC<BookListProps> = ({ onClose, onShowBookModal }) => {
  const { books, deleteBook } = useBookService();
  const [SelectedBook, setSelectedBook] = useAtom(BookAtom);
  const modal = useModal();
  const onDelete = (book: Book) => {
    modal.showModal({
      title: "删除",
      description:
        "确定删除吗？删除之后无法恢复，所有账本之下的全部数据都会删除",
      onCancel: () => {},
      onConfirm: () => {
        if (book?.isCurrent) {
          const defaultBook = books?.find((book) => book.isDefault === 1);
          if (defaultBook) {
            setSelectedBook(defaultBook);
          }
        }
        deleteBook(book.id);
      },
    });
  };

  const [appPath] = useAtom(AppPathAtom);
  const iconSrc = "/icon-side.png";
  const imageSrc = import.meta.env.DEV ? iconSrc : `${appPath}/dist/${iconSrc}`;
  return (
    <>
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
            src: imageSrc,
          }}
        />
        <Divider className="my-2" />
        <div className="flex flex-col gap-2 px-2">
          {books?.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              isActive={SelectedBook?.id === book.id}
              onSelect={async () => {
                await BookService.editBook(book.id, {
                  isCurrent: 1,
                });
                setSelectedBook(book);
                onClose();
              }}
              onEdit={() => {
                onShowBookModal(book);
              }}
              onDelete={() => onDelete(book)}
            />
          ))}
        </div>
        <Divider className="my-2" />
        <Button
          color="primary"
          className="w-full"
          size="sm"
          radius="sm"
          onClick={() => {
            onShowBookModal(undefined);
          }}
        >
          创建账本
        </Button>
      </div>
    </>
  );
};

export default BookList;
