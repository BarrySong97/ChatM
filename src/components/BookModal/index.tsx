import { useBookService } from "@/api/hooks/book";
import React, { FC, useState } from "react";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Form } from "antd";
import { Book } from "@db/schema";
import { TablerSettings } from "@/layout/NavigationLayout/components/icon";

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
        await editBook({ bookId: editingBook.id, book: values });
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

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        radius="sm"
        variant="flat"
        className="min-w-4 min-h-4"
        onPress={() => openModal()}
      >
        <TablerSettings />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingBook ? "编辑书籍" : "创建书籍"}</ModalHeader>
              <ModalBody>
                <Form form={form}>
                  <Form.Item
                    name="name"
                    label="书籍名称"
                    rules={[
                      {
                        required: true,
                        message: "请输入书籍名称",
                      },
                    ]}
                  >
                    <Input />
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
