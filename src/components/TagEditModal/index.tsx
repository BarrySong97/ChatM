import { useTagService } from "@/api/hooks/tag";
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
import { Form, message } from "antd";
import { Tag } from "@db/schema";
import { TagService } from "@/api/services/TagService";
import { useAtom, useAtomValue } from "jotai";
import { BookAtom, ShowTagEditModalAtom } from "@/globals";
import { MaterialSymbolsDelete } from "../AccountModal/icon";
import to from "await-to-js";
import { useFormError } from "@/hooks/useFormError";
export interface TagEditModalProps {
  isInCommand?: boolean;
}
const TagEditModal: FC<TagEditModalProps> = ({ isInCommand }) => {
  const { createTag, editTag, isCreateLoading, isEditLoading } =
    useTagService();
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useAtom(ShowTagEditModalAtom);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleSubmit = async () => {
    try {
      const [err, values] = await to(form.validateFields());
      if (err) return;
      const tags = values.tags;
      if (editingTag) {
        const tag = tags[0];
        await editTag({ tagId: editingTag.id, tag: tag });
      } else {
        for (const tag of tags) {
          await createTag({ tag });
          message.destroy();
        }
        message.success("创建成功");
      }
      setIsOpen(false);
      form.resetFields();
      setEditingTag(null);
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue(tag);
    } else {
      setEditingTag(null);
      form.resetFields();
    }
    setIsOpen(true);
  };
  const book = useAtomValue(BookAtom);
  const tags = Form.useWatch("tags", form);
  const { isSubmitDisabled } = useFormError(form);
  return (
    <>
      {!isInCommand && (
        <Button
          size="sm"
          radius="sm"
          color="primary"
          onPress={() => openModal()}
        >
          创建标签
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingTag ? "编辑标签" : "创建标签"}</ModalHeader>
              <ModalBody>
                <Form form={form}>
                  <Form.List name="tags" initialValue={[{}]}>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, index) => (
                          <div
                            key={field.key}
                            className="flex items-start gap-2"
                          >
                            {fields.length > 1 && (
                              <Button
                                onClick={() => remove(field.name)}
                                className="mt-1"
                                isIconOnly
                                variant="light"
                                radius="sm"
                                size="sm"
                                color="danger"
                              >
                                <MaterialSymbolsDelete className="text-lg" />
                              </Button>
                            )}
                            <Form.Item
                              {...field}
                              validateTrigger={["onBlur"]}
                              name={[field.name, "name"]}
                              className="flex-1"
                              rules={[
                                {
                                  required: true,
                                  message: "请输入标签名称",
                                },
                                {
                                  async validator(rule, value) {
                                    if (
                                      tags?.filter(
                                        (v: { name: string }) =>
                                          v?.name === value
                                      )?.length > 1
                                    ) {
                                      return Promise.reject(
                                        new Error("标签名称已存在")
                                      );
                                    }
                                    if (value) {
                                      const res = await TagService.checkTagName(
                                        value,
                                        book?.id || ""
                                      );

                                      if (res) {
                                        return Promise.reject(
                                          new Error("标签名称已存在")
                                        );
                                      } else {
                                        return Promise.resolve();
                                      }
                                    }
                                  },
                                },
                              ]}
                            >
                              <Input placeholder="请输入标签名称" />
                            </Form.Item>
                          </div>
                        ))}
                        {!editingTag && (
                          <Form.Item>
                            <Button
                              variant="flat"
                              size="sm"
                              radius="sm"
                              className="w-full"
                              onClick={() => add()}
                            >
                              继续添加
                            </Button>
                          </Form.Item>
                        )}
                      </>
                    )}
                  </Form.List>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !tags?.some((tag: { name: string }) => tag?.name) ||
                    isSubmitDisabled
                  }
                  onPress={handleSubmit}
                  isLoading={isCreateLoading || isEditLoading}
                >
                  {editingTag ? "保存" : "创建"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default TagEditModal;
