import { useAssetsService } from "@/api/hooks/assets";
import { AssetsService } from "@/api/services/AssetsSevice";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Form } from "antd";
import to from "await-to-js";
import React, { FC, useState } from "react";
import { TwitterPicker, SketchPicker } from "react-color";
export interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}
interface ColorPickerProps {
  colors: string[];
  selectedColor?: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onSelectColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Card radius="sm" shadow="sm" className="mt-2 w-full  shadow-lg p-4">
        <div className="grid grid-cols-7 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full ${color} ${
                selectedColor === color ? "ring-2 ring-white" : ""
              }`}
              onClick={() => {
                onSelectColor(color);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

const AccountModal: FC<AccountModalProps> = ({ isOpen, onOpenChange }) => {
  const [form] = Form.useForm();
  const { createAsset, editAsset, isCreateLoading, isEditLoading } =
    useAssetsService();

  return (
    <Modal size="3xl" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              添加资产账户
            </ModalHeader>
            <ModalBody>
              <Form form={form}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "请输入账户名称",
                    },
                  ]}
                >
                  <Input
                    label="账户名称"
                    radius="sm"
                    isRequired
                    placeholder="请输入账户名称"
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
                isLoading={isCreateLoading || isEditLoading}
                onPress={async () => {
                  const [err, value] = await to(form.validateFields());
                  await createAsset({ asset: { name: value.name } });
                  onClose();
                }}
              >
                确认
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;
