import { useBookService } from "@/api/hooks/book";
import emojiData from "@emoji-mart/data";
import { FC, useState } from "react";
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

export interface BookModalProps {}

const BookModal: FC<BookModalProps> = () => {
  const { createBook, editBook, isCreateLoading, isEditLoading } =
    useBookService();
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const name = Form.useWatch("name", form);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingBook) {
        await editBook({
          bookId: editingBook.id,
          book: {
            ...values,
            icon: iconId,
            isCurrent: false,
            isDeleted: false,
          },
        });
      } else {
        await createBook({ book: values });
      }
      setIsOpen(false);
      form.resetFields();
      setEditingBook(null);
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  const openModal = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      form.setFieldsValue(book);
    } else {
      setEditingBook(null);
      form.resetFields();
    }
    setIsOpen(true);
  };

  const [iconOpen, setIconOpen] = useState(false);
  const [iconId, setIconId] = useState<string | undefined>(undefined);
  return (
    <>
      <Button
        size="sm"
        radius="sm"
        variant="flat"
        className="w-full"
        onPress={() => openModal()}
      >
        创建账本
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingBook ? "编辑账本" : "创建账本"}</ModalHeader>
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
                  {editingBook ? "保存" : "创建"}
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
