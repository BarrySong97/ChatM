import React, { useEffect, useState } from "react";
import { Form, message } from "antd";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useProviderService } from "@/api/hooks/provider";
import { useModelService } from "@/api/hooks/model";
import { Provider } from "@db/schema";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
  MaterialSymbolsAddRounded,
} from "@/assets/icon";
import { PlusIcon } from "@/components/Transactions/icon";

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const [form] = Form.useForm();
  const { editProvider } = useProviderService();
  const { models, createModel } = useModelService(provider.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");

  useEffect(() => {
    if (provider) {
      form.setFieldsValue({
        baseUrl: provider.baseUrl || "",
        apiKey: provider.apiKey || "",
        defaultModel: new Set([provider.defaultModel]),
      });
    }
  }, [provider, form]);

  const handleSave = async (values: any) => {
    await editProvider({
      providerId: provider.id,
      provider: {
        name: provider.name,
        apiKey: values.apiKey,
        baseUrl: values.baseUrl,
        defaultModel: Array.from(values.defaultModel)[0] as string,
      },
    });
    message.success("保存成功");
  };

  const handleAddModel = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewModelName("");
  };

  const handleModalConfirm = async () => {
    if (newModelName.trim()) {
      await createModel({
        model: {
          name: newModelName,
          providerId: provider.id,
        },
      });
      closeModal();
    }
  };

  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Card className="w-full" shadow="sm">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{provider.name}</h3>
      </CardHeader>
      <CardBody>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="baseUrl" label="Proxy URL">
            <Input placeholder="Enter proxy URL (optional)" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key">
            <Input
              placeholder="Enter your API key"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label="toggle password visibility"
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
          </Form.Item>
          <Form.Item
            name="defaultModel"
            label="Default Model"
            valuePropName="selectedKeys"
            trigger="onSelectionChange"
          >
            <Select
              placeholder="Select a default model"
              startContent={
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleAddModel}
                  aria-label="Add new model"
                >
                  <MaterialSymbolsAddRounded className="text-base" />
                </Button>
              }
            >
              {models?.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  {model.name}
                </SelectItem>
              )) ?? []}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="submit" color="primary">
              Save
            </Button>
          </Form.Item>
        </Form>
      </CardBody>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">添加模型</ModalHeader>
          <ModalBody>
            <Input
              label="模型名称"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={closeModal}>
              取消
            </Button>
            <Button color="primary" onPress={handleModalConfirm}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default ProviderCard;
