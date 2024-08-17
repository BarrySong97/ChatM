import { useAssetsService } from "@/api/hooks/assets";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { useLiabilityService } from "@/api/hooks/liability";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Form } from "antd";
import to from "await-to-js";
import { FC } from "react";
export interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  type: "income" | "expense" | "asset" | "liability";
}

const AccountModal: FC<AccountModalProps> = ({
  isOpen,
  onOpenChange,
  type,
}) => {
  const [form] = Form.useForm();
  const { createAsset, editAsset, isCreateLoading, isEditLoading } =
    useAssetsService();
  const { createIncome } = useIncomeService();
  const { createExpense } = useExpenseService();
  const { createLiability } = useLiabilityService();

  const getModalTitle = (type: string) => {
    switch (type) {
      case "income":
        return "添加收入账户";
      case "expense":
        return "添加支出账户";
      case "asset":
        return "添加资产账户";
      case "liability":
        return "添加负债账户";
    }
  };
  const onCreate = async () => {
    const [err, value] = await to(form.validateFields());
    if (err) return;
    switch (type) {
      case "income":
        await createIncome({ income: { name: value.name } });
        break;
      case "expense":
        await createExpense({ expense: { name: value.name } });
        break;
      case "asset":
        await createAsset({ asset: { name: value.name } });
        break;
      case "liability":
        await createLiability({ liability: { name: value.name } });
        break;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {getModalTitle(type)}
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
                  await onCreate();
                  form.resetFields();
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
