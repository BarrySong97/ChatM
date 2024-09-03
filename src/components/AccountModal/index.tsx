import { useAssetsService } from "@/api/hooks/assets";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { useLiabilityService } from "@/api/hooks/liability";
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import bankcode from "./output.json";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Form } from "antd";
import to from "await-to-js";
import { FC, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { AccountType } from "./constant";
export interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  type: "income" | "expense" | "asset" | "liability";
  data: any;
}

type BankCode = {
  logo: string;
  name: string;
};
const AccountModal: FC<AccountModalProps> = ({
  isOpen,
  onOpenChange,
  type,
  data,
}) => {
  const [form] = Form.useForm();
  const { createAsset, editAsset, isCreateLoading, isEditLoading } =
    useAssetsService();
  const {
    createIncome,
    editIncome,
    isCreateLoading: isCreateIncomeLoading,
    isEditLoading: isEditIncomeLoading,
  } = useIncomeService();
  const {
    createExpense,
    editExpense,
    isCreateLoading: isCreateExpenseLoading,
    isEditLoading: isEditExpenseLoading,
  } = useExpenseService();
  const {
    createLiability,
    editLiability,
    isCreateLoading: isCreateLiabilityLoading,
    isEditLoading: isEditLiabilityLoading,
  } = useLiabilityService();

  const getModalTitle = (type: string) => {
    switch (type) {
      case "income":
        return data ? "编辑收入账户" : "添加收入账户";
      case "expense":
        return data ? "编辑支出账户" : "添加支出账户";
      case "asset":
        return data ? "编辑资产账户" : "添加资产账户";
      case "liability":
        return data ? "编辑负债账户" : "添加负债账户";
    }
  };
  const [emojiId, setEmojiId] = useState("stuck_out_tongue_winking_eye");
  const onCreate = async () => {
    const [err, value] = await to(form.validateFields());
    if (err) return;
    switch (type) {
      case "income":
        if (data) {
          await editIncome({
            income: { name: value.name, icon: emojiId },
            incomeId: data.id,
          });
        } else {
          await createIncome({ income: { name: value.name, icon: emojiId } });
        }
        break;
      case "expense":
        if (data) {
          await editExpense({
            expense: { name: value.name, icon: emojiId },
            expenseId: data.id,
          });
        } else {
          await createExpense({ expense: { name: value.name, icon: emojiId } });
        }
        break;
      case "asset":
        if (data) {
          await editAsset({
            asset: {
              name: value.name,
              initial_balance: value.initial_balance
                ? new Decimal(value.initial_balance).mul(100).toNumber()
                : 0,
              icon: emojiId,
            },
            assetId: data.id,
          });
        } else {
          await createAsset({
            asset: {
              name: value.name,
              initial_balance: value.initial_balance
                ? new Decimal(value.initial_balance).mul(100).toNumber()
                : 0,
              icon: emojiId,
            },
          });
        }
        break;
      case "liability":
        if (data) {
          await editLiability({
            liability: {
              name: value.name,
              icon: emojiId,
            },
            liabilityId: data.id,
          });
        } else {
          await createLiability({
            liability: {
              name: value.name,
              icon: emojiId,
            },
          });
        }
        break;
    }
  };
  const renderAssetsForm = () => {
    return (
      <Form.Item name="initial_balance">
        <Input radius="sm" type="number" placeholder="请输入账户初始金额" />
      </Form.Item>
    );
  };
  const renderIncomeForm = () => {
    return <div></div>;
  };
  const renderExpenseForm = () => {
    return <div></div>;
  };
  const renderLiabilityForm = () => {
    return <div></div>;
  };
  const renderForm = () => {
    switch (type) {
      case "income":
        return renderIncomeForm();
      case "expense":
        return renderExpenseForm();
      case "asset":
        return renderAssetsForm();
      case "liability":
        return renderLiabilityForm();
    }
  };
  useEffect(() => {
    if (data) {
      setEmojiId(data.icon ?? "stuck_out_tongue_winking_eye");
      form.setFieldsValue({
        ...data,
        initial_balance: data.initial_balance
          ? new Decimal(data.initial_balance).div(100).toNumber()
          : 0,
      });
    }
  }, [data]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [assetsType, setAssetsType] = useState<AccountType>(AccountType.Bank);

  const renderIconPicker = () => {
    switch (assetsType) {
      case AccountType.Bank:
        return <div>bank</div>;
      case AccountType.Cash:
        return <div>Emoji</div>;
      case AccountType.Other:
        return <div>other</div>;
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
                <div className="">
                  <Form.Item
                    name="name"
                    className="flex-1"
                    rules={[
                      {
                        required: true,
                        message: "请输入账户名称",
                      },
                    ]}
                  >
                    <Input
                      radius="sm"
                      isRequired
                      startContent={
                        <Popover
                          isOpen={emojiOpen}
                          showArrow
                          placement="right"
                          onOpenChange={setEmojiOpen}
                        >
                          <PopoverTrigger>
                            <Button
                              onClick={() => setEmojiOpen(true)}
                              size="sm"
                              radius="sm"
                              isIconOnly
                              className="text-xs"
                              variant="flat"
                            >
                              <em-emoji id={emojiId} size="1.5em"></em-emoji>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Picker
                              data={emojiData}
                              onEmojiSelect={(v: { id: string }) => {
                                // form.setFieldValue("icon", v.id);
                                setEmojiId(v.id);
                                setEmojiOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      }
                      placeholder="请输入账户名称"
                    />
                  </Form.Item>
                </div>

                {renderForm()}
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                isLoading={
                  isCreateLoading ||
                  isEditLoading ||
                  isCreateIncomeLoading ||
                  isEditIncomeLoading ||
                  isCreateExpenseLoading ||
                  isEditExpenseLoading ||
                  isCreateLiabilityLoading ||
                  isEditLiabilityLoading
                }
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
