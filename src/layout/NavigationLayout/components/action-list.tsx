import { useBookService } from "@/api/hooks/book";
import { MaterialSymbolsAddRounded } from "@/assets/icon";
import AccountIconRender from "@/components/AccountIconRender";
import BookModal from "@/components/BookModal";
import { PlusIcon } from "@/components/Transactions/icon";
import { AppPathAtom, BookAtom } from "@/globals";
import { indexDB } from "@/lib/indexdb";
import { Book } from "@db/schema";
import { Avatar, Button, Card, cn, Tooltip } from "@nextui-org/react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import React, { FC, useState } from "react";
export interface ActionListProps {}
const ActionList: FC<ActionListProps> = () => {
  const { books } = useBookService();
  const [appPath] = useAtom(AppPathAtom);
  const iconSrc = "/icon-side.webp";
  const imageSrc = import.meta.env.DEV ? iconSrc : `${appPath}/dist/${iconSrc}`;

  const [SelectedBook, setSelectedBook] = useAtom(BookAtom);
  const users = useLiveQuery(() => indexDB.users.toArray());
  const avatarSrc = users?.[0]?.avatar;
  const [editBook, setEditBook] = useState<Book>();
  const [isShowBookModal, setIsShowBookModal] = useState(false);
  return (
    <div className="pt-8 pb-2 h-full px-2 flex flex-col justify-between items-center">
      <div className="flex flex-col gap-3">
        {books?.map((book) => {
          const isActive = book.id === SelectedBook?.id;
          console.log(book.icon);
          return (
            <div key={book.id} className="relative">
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute bg-[#bebfc0] top-0 -left-4 w-[6px] h-full"
                    layoutId="active-book"
                    style={{
                      clipPath: "polygon(0 0, 100% 15%, 100% 80%, 0 100%)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                )}
              </AnimatePresence>
              <Tooltip content={book.name} placement="right">
                <Card
                  isPressable
                  onClick={() => {
                    setSelectedBook(book);
                  }}
                  className={cn(
                    "   w-[40px] h-[40px] flex items-center justify-center  text-lg rounded-lg",
                    "transition-colors transition-background-color duration-300",
                    {
                      "shadow-sm": !isActive,
                      "shadow-xl": isActive,
                    }
                  )}
                  key={book.id}
                >
                  {book?.icon ? (
                    <AccountIconRender icon={book.icon} />
                  ) : (
                    book.name?.[0]
                  )}
                </Card>
              </Tooltip>
            </div>
          );
        })}
        <Button
          className="max-w-[40px] min-w-[40px] rounded-lg h-[40px] text-xl p-0"
          onClick={() => {
            setEditBook(undefined);
            setIsShowBookModal(true);
          }}
          variant="flat"
        >
          <MaterialSymbolsAddRounded className="!text-xl" />
        </Button>
      </div>
      <div className="">
        <Avatar
          src={imageSrc}
          alt=""
          className="w-[40px] h-[40px] rounded-full"
        />
      </div>
      <BookModal
        book={editBook}
        isOpen={isShowBookModal}
        onOpenChange={setIsShowBookModal}
      />
    </div>
  );
};

export default ActionList;
