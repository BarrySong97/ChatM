import React, { useState } from "react";
import {
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { IonMdMore } from "@/components/ExpandTreeMenu/icon";
import AccountIconRender from "@/components/AccountIconRender";
import { Book } from "@db/schema";
import { message } from "antd";

interface BookItemProps {
  book: Book;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BookItem: React.FC<BookItemProps> = ({
  book,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      size="sm"
      className={cn("justify-between h-12  -ml-2", {
        "font-semibold": isActive,
      })}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      radius="sm"
    >
      <div className="flex items-center gap-2 ">
        <AccountIconRender
          icon={book.icon ? book?.icon : `emoji:stuck_out_tongue_winking_eye`}
          emojiSize="1.5em"
        />
        <div className="flex flex-col items-start">
          <div>{book.name}</div>
          <div className="text-xs text-gray-500">{book.currency}</div>
        </div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute text-lg right-[0px] ml-auto w-4.5 h-4.5 flex items-center justify-center rounded-md  transition-colors duration-200 "
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
                <DropdownItem onClick={onEdit} key="edit">
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
                    onDelete();
                  }}
                  key="delete"
                >
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
};

export default BookItem;
