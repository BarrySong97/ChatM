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
  Divider,
} from "@nextui-org/react";
import { Form, PlusOutlined, MinusCircleOutlined, message } from "antd";
import to from "await-to-js";
import { FC, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { IncomeService } from "@/api/services/IncomeService";
import { ExpenseService } from "@/api/services/ExpenseService";
import { AssetsService } from "@/api/services/AssetsSevice";
import { LiabilityService } from "@/api/services/LiabilityService";
import { MaterialSymbolsDelete, PhBankDuotone } from "./icon";
import BankIconPicker from "../BankIconPicker";
import { MaterialSymbolsArrowBackIosNewRounded } from "@/assets/icon";
import AccountIconRender from "../AccountIconRender";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";
import { useQueryClient } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
export interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  type: "income" | "expense" | "asset" | "liability";
  onDataChange?: () => void;
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
  onDataChange,
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
  const [iconId, setIconId] = useState<string | undefined>(undefined);
  const [iconType, setIconType] = useState<"emoji" | "bank">("emoji");

  const [selectIconType, setSelectIconType] = useState<"emoji" | "bank">();
  const book = useAtomValue(BookAtom);
  const queryClient = useQueryClient();
  const onCreate = async () => {
    const [err, values] = await to(form.validateFields());
    if (err) return;

    const accounts = values.accounts;
    for (const account of accounts) {
      const icon = account.icon || iconId; // 假设每个账户可以有自己的图标，否则使用全局的
      switch (type) {
        case "income":
          if (data) {
            await editIncome({
              income: { name: account.name, icon },
              incomeId: data.id,
            });
          } else {
            await createIncome({ income: { name: account.name, icon } });
          }
          break;
        case "expense":
          if (data) {
            await editExpense({
              expense: { name: account.name, icon },
              expenseId: data.id,
            });
          } else {
            await createExpense({ expense: { name: account.name, icon } });
          }
          break;
        case "asset":
          if (data) {
            await editAsset({
              asset: {
                name: account.name,
                initial_balance: account.initial_balance
                  ? new Decimal(account.initial_balance).mul(100).toNumber()
                  : 0,
                icon,
              },
              assetId: data.id,
            });
          } else {
            await createAsset({
              asset: {
                name: account.name,
                initial_balance: account.initial_balance
                  ? new Decimal(account.initial_balance).mul(100).toNumber()
                  : 0,
                icon,
              },
            });
          }
          break;
        case "liability":
          if (data) {
            await editLiability({
              liability: {
                name: account.name,
                icon,
              },
              liabilityId: data.id,
            });
          } else {
            await createLiability({
              liability: {
                name: account.name,
                icon,
              },
            });
          }
          break;
      }
      message.destroy();
    }
    if (data) {
      message.success("编辑成功");
    } else {
      message.success("创建成功");
    }
    queryClient.invalidateQueries({ refetchActive: true });
  };
  useEffect(() => {
    if (data) {
      if (data.icon && data.icon.includes(":")) {
        const arr = data.icon.split(":");
        setIconId(data.icon);
        setIconType(arr[0] as "emoji" | "bank");
        setSelectIconType(arr[0] as "emoji" | "bank");
      } else {
        setIconId(data.icon);
        setIconType("emoji");
      }
      form.setFieldsValue({
        accounts: [
          {
            ...data,
            initial_balance: data.initial_balance
              ? new Decimal(data.initial_balance).div(100).toNumber()
              : 0,
          },
        ],
      });
    }
  }, [data]);
  const [iconOpen, setIconOpen] = useState(false);

  const renderIconPicker = () => {
    if (selectIconType === "bank") {
      return (
        <div>
          <BankIconPicker
            onChange={(v) => {
              setIconId(`bank:${v}`);
              setIconOpen(false);
              setIconType("bank");
            }}
            title={
              <div className="flex items-center gap-2">
                <Button
                  variant="light"
                  radius="sm"
                  size="sm"
                  isIconOnly
                  onClick={() => setSelectIconType(undefined)}
                >
                  <MaterialSymbolsArrowBackIosNewRounded />
                </Button>
                <div>请选择一个银行</div>
              </div>
            }
          />
        </div>
      );
    }
    if (selectIconType === "emoji") {
      return (
        <div>
          <div className="flex items-center gap-2 py-1">
            <Button
              variant="light"
              radius="sm"
              size="sm"
              isIconOnly
              onClick={() => setSelectIconType(undefined)}
            >
              <MaterialSymbolsArrowBackIosNewRounded />
            </Button>
            <div>请选择一个表情</div>
          </div>
          <Picker
            data={emojiData}
            onEmojiSelect={(v: { id: string }) => {
              setIconId(`emoji:${v.id}`);
              setIconType("emoji");
              setIconOpen(false);
            }}
          />
        </div>
      );
    }
    return (
      <Listbox title="选择图标" className="p-2">
        <ListboxSection title="选择图标类型">
          <ListboxItem
            startContent={<PhBankDuotone className="text-lg" />}
            key="bank"
            onClick={() => setSelectIconType("bank")}
          >
            银行图标
          </ListboxItem>
          <ListboxItem
            onClick={() => setSelectIconType("emoji")}
            startContent={
              <AccountIconRender icon={`emoji:stuck_out_tongue_winking_eye`} />
            }
            key="emoji"
          >
            表情图标
          </ListboxItem>
        </ListboxSection>
      </Listbox>
    );
  };
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen]);

  const renderAccountForm = (
    field: any,
    index: number,
    fields: any[],
    remove: (name: number | number[]) => void
  ) => {
    return (
      <div key={field.key}>
        <div className="flex items-start gap-2 ">
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
                async validator(rule, value) {
                  if (!value || value === data?.name) {
                    return Promise.resolve(); // 让 required 规则处理空值
                  }
                  let res = false;

                  switch (type) {
                    case "income":
                      res = await IncomeService.checkIncomeName(
                        value,
                        book?.id || ""
                      );
                      break;
                    case "expense":
                      res = await ExpenseService.checkExpenseName(
                        value,
                        book?.id || ""
                      );
                      break;
                    case "asset":
                      res = await AssetsService.checkAssetName(
                        value,
                        book?.id || ""
                      );

                      break;
                    case "liability":
                      res = await LiabilityService.checkLiabilityName(
                        value,
                        book?.id || ""
                      );
                      break;
                  }

                  if (res) {
                    return Promise.reject("账户名称已存在");
                  }
                  return Promise.resolve();
                },
              },
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
                  isOpen={iconOpen}
                  showArrow
                  placement="right"
                  onOpenChange={setIconOpen}
                >
                  <PopoverTrigger>
                    <Button
                      onClick={() => setIconOpen(true)}
                      size="sm"
                      radius="sm"
                      isIconOnly
                      className="text-xs"
                      variant="flat"
                    >
                      <AccountIconRender
                        icon={
                          iconId ? iconId : "emoji:stuck_out_tongue_winking_eye"
                        }
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    {renderIconPicker()}
                  </PopoverContent>
                </Popover>
              }
              placeholder="请输入账户名称"
            />
          </Form.Item>
        </div>

        {type === "asset" && (
          <Form.Item {...field} name={[field.name, "initial_balance"]}>
            <Input radius="sm" type="number" placeholder="请输入账户初始金额" />
          </Form.Item>
        )}
      </div>
    );
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
                <Form.List name="accounts" initialValue={[{}]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) =>
                        renderAccountForm(field, index, fields, remove)
                      )}
                      {data ? (
                        <></>
                      ) : (
                        <Form.Item>
                          <Button
                            color="primary"
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
