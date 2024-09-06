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
} from "@nextui-org/react";
import { Form } from "antd";
import { Book } from "@db/schema";
import AccountIconRender from "../AccountIconRender";
import Picker from "@emoji-mart/react";
import { MaterialSymbolsArrowBackIosNewRounded } from "@/assets/icon";

export interface BookModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  book?: Book;
}

const BookModal: FC<BookModalProps> = ({ isOpen, onOpenChange, book }) => {
  const { createBook, editBook, isCreateLoading, isEditLoading } =
    useBookService();
  const [form] = Form.useForm();
  const name = Form.useWatch("name", form);

  useEffect(() => {
    form.setFieldsValue({
      name: book?.name,
      icon: book?.icon,
    });
  }, [book]);
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
      } else {
        await createBook({ book: values });
      }
      onOpenChange(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  const [iconOpen, setIconOpen] = useState(false);
  const [iconId, setIconId] = useState<string | undefined>(undefined);
  return (
    <>
      <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
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
    </>
  );
};

export default BookModal;
