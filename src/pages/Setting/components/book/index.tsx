import React, { FC, useEffect, useState } from "react";
import { Book } from "@db/schema";
import SettingWrapper from "../setting-wrapper";
import { Button, Input } from "@nextui-org/react";
import { useAtom } from "jotai";
import { BookAtom } from "@/globals";
import { useBookService } from "@/api/hooks/book";
import { Form } from "antd";
export interface AboutProps {
  book?: Book;
}
const BookSetting: FC<AboutProps> = ({ book }) => {
  const [useBook, setUseBook] = useAtom(BookAtom);
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
  useEffect(() => {
    form.setFieldsValue(book);
  }, [book]);
  return (
    <SettingWrapper
      title={
        <div className="flex items-center justify-between pr-4">
          <div>账本</div>
          {useBook?.id !== book?.id ? (
            <Button size="sm" radius="sm" color="primary" variant="flat">
              设置为当前账本
            </Button>
          ) : null}
        </div>
      }
    >
      <Form form={form}>
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: "请输入书籍名称",
            },
          ]}
        >
          <Input
            size="sm"
            radius="sm"
            label="书籍名称"
            placeholder="请输入书籍名称"
          />
        </Form.Item>
      </Form>
    </SettingWrapper>
  );
};

export default BookSetting;
