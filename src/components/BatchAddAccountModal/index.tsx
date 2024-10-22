import { useAssetsService } from "@/api/hooks/assets";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { useLiabilityService } from "@/api/hooks/liability";
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Button,
  Input,
  Listbox,
  ListboxSection,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@nextui-org/react";
import { Form, message } from "antd";
import to from "await-to-js";
import { FC, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { IncomeService } from "@/api/services/IncomeService";
import { ExpenseService } from "@/api/services/ExpenseService";
import { AssetsService } from "@/api/services/AssetsSevice";
import { LiabilityService } from "@/api/services/LiabilityService";
import BankIconPicker from "../BankIconPicker";
import { MaterialSymbolsArrowBackIosNewRounded } from "@/assets/icon";
import AccountIconRender from "../AccountIconRender";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";
import { useQueryClient } from "react-query";
import { useFormError } from "@/hooks/useFormError";
export interface BatchAddAccountModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  type: "income" | "expense" | "asset" | "liability";
  data?: any;
}

type BankCode = {
  logo: string;
  name: string;
};
const BatchAddAccountModal: FC<BatchAddAccountModalProps> = ({
  isOpen,
  onOpenChange,
  type,
  data,
}) => {
  const [form] = Form.useForm();
  const accounts = Form.useWatch("accounts", form);
  const { createAsset } = useAssetsService();
  const { createIncome } = useIncomeService();
  const { createExpense } = useExpenseService();
  const { createLiability } = useLiabilityService();

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

  const [submitLoading, setSubmitLoading] = useState(false);
  const [accountString, setAccountString] = useState<string>();

  const queryClient = useQueryClient();
  const onCreate = async () => {
    if (!accountString) return;

    const accounts = accountString
      .split("\n")
      .map((account) => ({ name: account }));
    setSubmitLoading(true);
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      switch (type) {
        case "income":
          await createIncome({ income: { name: account.name } });
          break;
        case "expense":
          await createExpense({ expense: { name: account.name } });
          break;
        case "asset":
          await createAsset({
            asset: {
              name: account.name,
              initial_balance: 0,
            },
          });
          break;
        case "liability":
          await createLiability({
            liability: {
              name: account.name,
              initial_balance: 0,
            },
          });
          break;
      }
      message.destroy();
    }
    setSubmitLoading(false);
    message.success("创建成功");
    queryClient.invalidateQueries({ refetchActive: true });
  };

  useEffect(() => {
    if (!isOpen) {
      setAccountString("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {getModalTitle(type)}
            </ModalHeader>
            <ModalBody>
              <Textarea
                label="账户列表"
                placeholder="请输入账名称，每行一个账户"
                value={accountString}
                classNames={{
                  input: "resize-y min-h-[200px]",
                }}
                onValueChange={setAccountString}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                isDisabled={!accountString}
                isLoading={submitLoading}
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

export default BatchAddAccountModal;
