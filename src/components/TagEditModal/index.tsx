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
import { Form } from "antd";
import { Tag } from "@db/schema";
import { TagService } from "@/api/services/TagService";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";
export interface TagEditModalProps {}
const TagEditModal: FC<TagEditModalProps> = () => {
  const { createTag, editTag, isCreateLoading, isEditLoading } =
    useTagService();
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const name = Form.useWatch("name", form);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await editTag({ tagId: editingTag.id, tag: values });
      } else {
        await createTag({ tag: values });
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
  return (
    <>
      <Button size="sm" radius="sm" color="primary" onPress={() => openModal()}>
        创建标签
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingTag ? "编辑标签" : "创建标签"}</ModalHeader>
              <ModalBody>
                <Form form={form}>
                  <Form.Item
                    name="name"
                    label="标签名称"
                    validateTrigger="onBlur"
                    rules={[
                      {
                        required: true,
                        message: "请输入标签名称",
                      },
                      {
                        async validator(rule, value) {
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
