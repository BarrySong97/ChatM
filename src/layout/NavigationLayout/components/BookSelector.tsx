import React from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { RiMore2Fill } from "./icon";
import { BookAtom } from "@/globals";
import { useAtom, useAtomValue } from "jotai";
import { Book } from "@db/schema";
import { useModal } from "@/components/GlobalConfirmModal";
import { useBookService } from "@/api/hooks/book";
import { BookService } from "@/api/services/BookService";
import { message } from "antd";

interface BookSelectorProps {
  onEditClick: () => void;
}
const BookSelector: React.FC<BookSelectorProps> = ({ onEditClick }) => {
  const [book, setSelectedBook] = useAtom(BookAtom);
  const { books, deleteBook } = useBookService();
  const modal = useModal();
  const onDelete = (book: Book) => {
    if (book.isDefault) {
      message.error("默认账本不能删除");
      return;
    }
    modal.showModal({
      title: "删除",
      description:
        "确定删除吗？删除之后无法恢复，所有账本之下的全部数据都会删除",
      onCancel: () => {},
      onConfirm: async () => {
        await deleteBook(book.id);
        const books = await BookService.listBooks();
        const defaultBook = books?.find((book) => book.isDefault === 1);
        if (defaultBook) {
          setSelectedBook(defaultBook);
        }
      },
    });
  };
  return (
    <div className="mr-2 ml-3 default-200 mb-2 rounded-md">
      <div className="w-full justify-between flex">
        <div className="py-1 px-2 w-full flex items-center justify-start mb-0">
          <div
            className="inline-flex items-start justify-start gap-3 rounded-small outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 z-10 aria-expanded:scale-[0.97] aria-expanded:opacity-70 subpixel-antialiased"
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            <div className="inline-flex items-center gap-0.5">
              <span className="text-small text-default-500">
                {book?.currency}
              </span>
              <span>·</span>
              <span className="text-small font-semibold text-inherit">
                {book?.name}
              </span>
            </div>
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm" radius="sm">
              <RiMore2Fill className="text-sm" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem onClick={onEditClick} key="edit">
              编辑
            </DropdownItem>
            <DropdownItem
              onClick={() => book && onDelete(book)}
              key="delete"
              className="text-danger"
              color="danger"
            >
              删除
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default BookSelector;
