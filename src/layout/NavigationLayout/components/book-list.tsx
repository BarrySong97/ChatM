import { useBookService } from "@/api/hooks/book";
import { BookAtom } from "@/globals";
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
export interface BookListProps {}
const BookList: FC<BookListProps> = () => {
  const { books, deleteBook } = useBookService();
  const [SelectedBook, setSelectedBook] = useAtom(BookAtom);
  const modal = useModal();
  const [isShowBookModal, setIsShowBookModal] = useState(false);
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
  const [editBook, setEditBook] = useState<Book>();
  const [isHovered, setIsHovered] = useState(false);

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
            src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
          }}
        />
        <Divider className="my-2" />
        <div className="flex flex-col gap-2 px-2">
          {books?.map((book) => {
            const isActive = SelectedBook?.id === book.id;
            return (
              <Button
                size="sm"
                className={cn("justify-between p-2 -ml-2", {
                  "font-semibold": isActive,
                })}
                onClick={async () => {
                  await BookService.editBook(book.id, {
                    isCurrent: 1,
                  });
                  setSelectedBook(book);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                variant={isActive ? "flat" : "light"}
                endContent={
                  isActive ? (
                    <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>
                  ) : null
                }
                radius="sm"
                key={book.id}
              >
                <div className="flex items-center gap-2">
                  <AccountIconRender
                    icon={
                      book.icon
                        ? book?.icon
                        : `emoji:stuck_out_tongue_winking_eye`
                    }
                  />
                  <div> {book.name}</div>
                </div>
                <AnimatePresence>
                  {isHovered ? (
                    <>
                      <motion.div
                        className="absolute text-lg right-[0px] ml-auto w-4.5 h-4.5 flex items-center justify-center rounded-md hover:bg-default/100 transition-colors duration-200 "
                        style={{
                          right: !isActive ? "0px" : "16px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Dropdown>
                          <DropdownTrigger>
                            <div>
                              <IonMdMore />
                            </div>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              onClick={() => {
                                setEditBook(book);
                                setIsShowBookModal(true);
                              }}
                              key="edit"
                            >
                              编辑
                            </DropdownItem>
                            <DropdownItem
                              className="text-danger"
                              color="danger"
                              onClick={() => {
                                if (book.isDefault) {
                                  message.error("默认账本无法删除");
                                  return;
                                }
                                onDelete(book);
                              }}
                              key="delete"
                            >
                              删除
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </motion.div>
                    </>
                  ) : null}
                </AnimatePresence>
              </Button>
            );
          }) ?? []}
        </div>
        <Divider className="my-2" />
        <Button
          color="primary"
          className="w-full"
          size="sm"
          radius="sm"
          onClick={() => {
            setEditBook(undefined);
            setIsShowBookModal(true);
          }}
        >
          创建账本
        </Button>
      </div>
      <BookModal
        book={editBook}
        isOpen={isShowBookModal}
        onOpenChange={setIsShowBookModal}
      />
    </>
  );
};

export default BookList;
