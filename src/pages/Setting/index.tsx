import React, { FC, useState } from "react";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { MdiRobotOutline, PhCreditCardLight, PhQuestion } from "./icon";
import { BookAtom } from "@/globals";
import { useAtom } from "jotai";
import { useBookService } from "@/api/hooks/book";
import AccountIconRender from "@/components/AccountIconRender";
import Pricing from "./components/pricing";
import About from "./components/about";
import { Book } from "@db/schema";
import BookSetting from "./components/book";
import AISetting from "./components/ai";
export interface SettingProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const Setting: FC<SettingProps> = ({ isOpen, setIsOpen }) => {
  const menus = [
    { key: "pricing", name: "定价", icon: <PhCreditCardLight /> },
    {
      key: "ai",
      name: "AI设置",
      icon: <MdiRobotOutline />,
    },

    {
      key: "about",
      name: "关于流记",
      icon: <PhQuestion />,
    },
  ];
  const [activeKey, setActiveKey] = useState<string>("about");
  const [selectMenuBook, setselectMemnuBook] = useState<Book>();
  const { books, isLoadingBooks, editBook, deleteBook, createBook } =
    useBookService();
  const [useBook, setUseBook] = useAtom(BookAtom);
  const renderComponent = () => {
    switch (activeKey) {
      case "pricing":
        return <Pricing />;
      case "about":
        return <About />;
      case "book":
        return <BookSetting book={selectMenuBook} />;
      case "ai":
        return <AISetting />;
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
                <div className="text-lg font-bold flex items-end gap-2">
                  <span> 设置</span>
                </div>
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
                {/* <div className="flex flex-col gap-2 mt-4">
                  <div className="text-sm text-[#575859]">账本</div>
                  {books?.map((book) => {
                    const isActive = selectMenuBook?.id === book.id;
                    const isSelectBook = useBook?.id === book.id;
                    return (
                      <Button
                        size="sm"
                        className={cn("justify-between p-2 -ml-2", {
                          "font-semibold": isActive,
                        })}
                        onClick={() => {
                          setselectMemnuBook(book);
                          setActiveKey("book");
                        }}
                        variant={isActive ? "flat" : "light"}
                        endContent={
                          isSelectBook ? (
                            <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>
                          ) : null
                        }
                        radius="sm"
                        key={book.id}
                      >
                        <div className="flex items-center gap-2">
                          <AccountIconRender
                            icon={`emoji:stuck_out_tongue_winking_eye`}
                          />
                          <div> {book.name}</div>
                        </div>
                      </Button>
                    );
                  }) ?? []}
                </div> */}
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
