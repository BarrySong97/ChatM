import { useBookService } from "@/api/hooks/book";
import emojiData from "@emoji-mart/data";
import { FC, useEffect, useState } from "react";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PopoverContent,
  Popover,
  PopoverTrigger,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { Form } from "antd";
import { Book } from "@db/schema";
import AccountIconRender from "../AccountIconRender";
import Picker from "@emoji-mart/react";
import { MaterialSymbolsArrowBackIosNewRounded } from "@/assets/icon";
import { BookAtom } from "@/globals";
import { useAtomValue, useSetAtom } from "jotai";

export interface BookModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  book: Book | null;
}
const currencyOptions = [
  { label: "人民币", value: "CNY" },
  { label: "美元", value: "USD" },
  { label: "欧元", value: "EUR" },
  { label: "日元", value: "JPY" },
  { label: "英镑", value: "GBP" },
  { label: "加拿大元", value: "CAD" },
  { label: "澳大利亚元", value: "AUD" },
  { label: "瑞士法郎", value: "CHF" },
  { label: "港币", value: "HKD" },
  { label: "新加坡元", value: "SGD" },
];

const BookModal: FC<BookModalProps> = ({ isOpen, onOpenChange, book }) => {
  const { createBook, editBook, isCreateLoading, isEditLoading } =
    useBookService();
  const [form] = Form.useForm();
  const name = Form.useWatch("name", form);

  const [iconOpen, setIconOpen] = useState(false);
  const setCurrentBook = useSetAtom(BookAtom);
  const [iconId, setIconId] = useState<string | undefined>(undefined);
  useEffect(() => {
    form.setFieldsValue({
      ...(book || {}),
    });
    if (book?.icon) {
      setIconId(book.icon);
    }
  }, [book, isOpen]);
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (book) {
        await editBook({
          bookId: book.id,
          book: {
            ...values,
            icon: iconId,
          },
        });
        setCurrentBook({
          id: book.id,
          ...values,
          icon: iconId || null,
        });
      } else {
        await createBook({
          book: {
            ...values,
            icon: iconId,
          },
        });
      }
      onOpenChange(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{book ? "编辑账本" : "创建账本"}</ModalHeader>
            <ModalBody>
              <Form form={form}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "请输入账本名称",
                    },
                  ]}
                >
                  <Input
                    radius="sm"
                    startContent={
                      <Popover
                        isOpen={iconOpen}
                        showArrow
                        placement="right"
                        onOpenChange={setIconOpen}
                      >
                        <PopoverTrigger>
                          <Button
                            onClick={() => setIconOpen(true)}
                            size="sm"
                            radius="sm"
                            isIconOnly
                            className="text-xs"
                            variant="flat"
                          >
                            <AccountIconRender
                              icon={
                                iconId
                                  ? iconId
                                  : "emoji:stuck_out_tongue_winking_eye"
                              }
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <div>
                            <div className="flex items-center gap-2 py-1">
                              <Button
                                variant="light"
                                radius="sm"
                                size="sm"
                                isIconOnly
                              >
                                <MaterialSymbolsArrowBackIosNewRounded />
                              </Button>
                              <div>请选择一个表情</div>
                            </div>
                            <Picker
                              data={emojiData}
                              onEmojiSelect={(v: { id: string }) => {
                                setIconId(`emoji:${v.id}`);
                                setIconOpen(false);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    }
                    placeholder="请输入账本名称"
                  />
                </Form.Item>
                <Form.Item
                  name="currency"
                  valuePropName="selectedKey"
                  trigger="onSelectionChange"
                >
                  <Autocomplete
                    placeholder="请选择货币，使用code搜索"
                    aria-label="货币"
                  >
                    {currencyOptions.map((item) => (
                      <AutocompleteItem
                        startContent={item.label}
                        key={item.value}
                        value={item.value}
                      >
                        {item.value}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </Form.Item>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                isDisabled={!name}
                onPress={handleSubmit}
                isLoading={isCreateLoading || isEditLoading}
              >
                {book ? "保存" : "创建"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookModal;
