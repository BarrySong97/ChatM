import { useBookService } from "@/api/hooks/book";
import { BookAtom } from "@/globals";
import { Button, Chip, cn, Divider, User } from "@nextui-org/react";
import { useAtom } from "jotai";
import { FC } from "react";
import BookModal from "@/components/BookModal";
import AccountIconRender from "@/components/AccountIconRender";
import { BookService } from "@/api/services/BookService";
export interface BookListProps {}
const BookList: FC<BookListProps> = () => {
  const { books, isLoadingBooks, editBook, deleteBook, createBook } =
    useBookService();
  const [SelectedBook, setSelectedBook] = useAtom(BookAtom);

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
                  icon={book.id ?? `emoji:stuck_out_tongue_winking_eye`}
                />
                <div> {book.name}</div>
              </div>
              <div className="absolute right-2">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => {
                    BookService.deleteBook(book.id);
                  }}
                >
                  删除
                </Button>
              </div>
            </Button>
          );
        }) ?? []}
      </div>
      <Divider className="my-2" />
      <BookModal />
    </div>
  );
};

export default BookList;
