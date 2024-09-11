import React, { useEffect } from "react";
import { Form } from "antd";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
} from "@nextui-org/react";
import { useProviderService } from "@/api/hooks/provider";
import { useModelService } from "@/api/hooks/model";
import { Provider } from "@db/schema";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/assets/icon";

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const [form] = Form.useForm();
  const { editProvider, providers } = useProviderService();
  const { models } = useModelService(provider.id);

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
            <Select placeholder="Select a default model">
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
    </Card>
  );
};

export default ProviderCard;
