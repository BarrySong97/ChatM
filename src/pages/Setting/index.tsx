import React, { FC, useState } from "react";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { PhCreditCardLight, PhQuestion } from "./icon";
import { BookAtom } from "@/globals";
import { useAtom } from "jotai";
import { useBookService } from "@/api/hooks/book";
import AccountIconRender from "@/components/AccountIconRender";
import Pricing from "./components/pricing";
import About from "./components/about";
import { Book } from "@db/schema";
import BookSetting from "./components/book";
export interface SettingProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const Setting: FC<SettingProps> = ({ isOpen, setIsOpen }) => {
  const menus = [
    { key: "pricing", name: "定价", icon: <PhCreditCardLight /> },
    {
      key: "about",
      name: "关于",
      icon: <PhQuestion />,
    },
  ];
  const [activeKey, setActiveKey] = useState<string>("about");
  const [selectMenuBook, setselectMemnuBook] = useState<Book>();
  const { books, isLoadingBooks, editBook, deleteBook, createBook } =
    useBookService();
  const [book, setBook] = useAtom(BookAtom);
  const selectedBookKeys = book ? [book.id] : [];
  const renderComponent = () => {
    switch (activeKey) {
      case "pricing":
        return <Pricing />;
      case "about":
        return <About />;
      case "book":
        return <BookSetting book={selectMenuBook} />;
      default:
        return null;
    }
  };
  return (
    <Modal
      size="4xl"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* <ModalHeader>设置</ModalHeader> */}
            <ModalBody className="p-0 flex flex-row ">
              <div className="w-[200px] rounded-l-large bg-[#F4F4F5]  p-4 ">
                <div className="text-lg font-bold">设置</div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="text-sm text-[#575859]">常规</div>
                  {menus.map((item) => {
                    const isActive = activeKey === item.key;
                    return (
                      <Button
                        key={item.name}
                        className={cn("justify-start p-2 -ml-2", {
                          "font-semibold": isActive,
                        })}
                        onClick={() => {
                          setActiveKey(item.key);
                          setselectMemnuBook(null);
                        }}
                        startContent={
                          <span className="text-lg text-[#575859]">
                            {item.icon}
                          </span>
                        }
                        variant={isActive ? "flat" : "light"}
                        size="sm"
                        radius="sm"
                      >
                        {item.name}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="text-sm text-[#575859]">账本</div>
                  {books?.map((book) => {
                    const isActive = selectMenuBook?.id === book.id;
                    return (
                      <Button
                        size="sm"
                        className={cn("justify-start p-2 -ml-2", {
                          "font-semibold": isActive,
                        })}
                        onClick={() => {
                          setselectMemnuBook(book);
                          setActiveKey("book");
                        }}
                        variant={isActive ? "flat" : "light"}
                        startContent={
                          <AccountIconRender
                            icon={`emoji:stuck_out_tongue_winking_eye`}
                          />
                        }
                        radius="sm"
                        key={book.id}
                      >
                        {book.name}
                      </Button>
                    );
                  }) ?? []}
                </div>
              </div>
              <div className="flex-1 p-4  ">{renderComponent()}</div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Setting;
