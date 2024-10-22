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
} from "@nextui-org/react";
import { Form, message } from "antd";
import to from "await-to-js";
import { FC, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { IncomeService } from "@/api/services/IncomeService";
import { ExpenseService } from "@/api/services/ExpenseService";
import { AssetsService } from "@/api/services/AssetsSevice";
import { LiabilityService } from "@/api/services/LiabilityService";
import {
  MaterialSymbolsDelete,
  MingcuteAlipayFill,
  MingcuteWechatPayFill,
  PhBankDuotone,
} from "./icon";
import BankIconPicker from "../BankIconPicker";
import { MaterialSymbolsArrowBackIosNewRounded } from "@/assets/icon";
import AccountIconRender from "../AccountIconRender";
import { useAtomValue, useSetAtom } from "jotai";
import { BookAtom, ShowBatchAddAccountModalAtom } from "@/globals";
import { useQueryClient } from "react-query";
import { useFormError } from "@/hooks/useFormError";
export interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  type: "income" | "expense" | "asset" | "liability";
  data?: any;
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
  const accounts = Form.useWatch("accounts", form);
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
  const { createLiability, editLiability } = useLiabilityService();

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
  const [iconId, setIconId] = useState<string[]>([]);

  const [iconType, setIconType] = useState<"emoji" | "bank" | "wallet">(
    "emoji"
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectIconType, setSelectIconType] = useState<
    "emoji" | "bank" | "wallet" | undefined
  >("emoji");
  const book = useAtomValue(BookAtom);
  const queryClient = useQueryClient();
  const onCreate = async () => {
    const [err, values] = await to(form.validateFields());
    if (err) return;

    const accounts = values.accounts;
    setSubmitLoading(true);
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const icon = iconId[i] || account.icon; // 假设每个账户可以有自己的图标，否则使用全局的
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
                initial_balance: account.initial_balance
                  ? new Decimal(account.initial_balance).mul(100).toNumber()
                  : 0,
              },
              liabilityId: data.id,
            });
          } else {
            await createLiability({
              liability: {
                name: account.name,
                icon,
                initial_balance: account.initial_balance
                  ? new Decimal(account.initial_balance).mul(100).toNumber()
                  : 0,
              },
            });
          }
          break;
      }
      message.destroy();
    }
    setSubmitLoading(false);
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
        setIconId([data.icon]);
        setIconType(arr[0] as "emoji" | "bank");
        setSelectIconType(arr[0] as "emoji" | "bank");
      } else {
        setIconId([data.icon]);
        setIconType("emoji");
      }
      form.setFieldsValue({
        accounts: [
          {
            ...(data || {}),
            initial_balance: data?.initial_balance
              ? new Decimal(data.initial_balance).div(100).toNumber()
              : 0,
          },
        ],
      });
    }
  }, [data]);
  const [iconOpen, setIconOpen] = useState<Array<boolean>>([false]);

  const renderIconPicker = (index: number) => {
    if (selectIconType === "bank") {
      return (
        <div>
          <BankIconPicker
            onChange={(v) => {
              setIconId((prev) => {
                prev[index] = `bank:${v}`;
                return [...prev];
              });
              setIconOpen((prev) => {
                return prev.map((v) => false);
              });
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
              setIconId((prev) => {
                prev[index] = `emoji:${v.id}`;
                return [...prev];
              });
              setIconType("emoji");
              setIconOpen((prev) => {
                return prev.map((v) => false);
              });
            }}
          />
        </div>
      );
    }
    if (selectIconType === "wallet") {
      return (
        <div className="p-1">
          <div className="flex items-center">
            <Button
              variant="light"
              radius="sm"
              size="sm"
              isIconOnly
              onClick={() => setSelectIconType(undefined)}
            >
              <MaterialSymbolsArrowBackIosNewRounded />
            </Button>
            <div>请选择</div>
          </div>
          <Listbox>
            <ListboxSection>
              <ListboxItem
                onClick={() => {
                  setIconId((prev) => {
                    prev[index] = "wallet:alipay";
                    return prev.map((v) => "wallet:alipay");
                  });
                  setIconType("wallet");
                  setIconOpen((prev) => {
                    return prev.map((v) => false);
                  });
                }}
                startContent={
                  <MingcuteAlipayFill className="text-xl  text-[#1677FF]" />
                }
                key="bank"
              >
                支付宝
              </ListboxItem>
              <ListboxItem
                onClick={() => {
                  setIconId((prev) => {
                    prev[index] = "wallet:wechat";
                    return [...prev];
                  });
                  setIconType("wallet");
                  setIconOpen((prev) => {
                    return prev.map((v) => false);
                  });
                }}
                startContent={
                  <MingcuteWechatPayFill className="text-xl text-[#1AAD19]" />
                }
                key="bank"
              >
                微信
              </ListboxItem>
            </ListboxSection>
          </Listbox>
        </div>
      );
    }
    return (
      <Listbox title="选择图标" className="p-2">
        <ListboxSection title="选择图标类型">
          <ListboxItem
            startContent={
              <MingcuteAlipayFill className="text-xl  text-[#1677FF]" />
            }
            key="wallet"
            onClick={() => setSelectIconType("wallet")}
          >
            电子钱包
          </ListboxItem>
          <ListboxItem
            startContent={<PhBankDuotone className="text-xl " />}
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
      setIconId([]);
      setSelectIconType(undefined);
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
                  if (
                    accounts?.filter((v: { name: string }) => v?.name === value)
                      .length > 1
                  ) {
                    return Promise.reject("账户名称已存在");
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
                  isOpen={iconOpen[index] || false}
                  showArrow
                  placement="right"
                  onOpenChange={(v) => {
                    if (!v) {
                      setIconOpen((prev) => {
                        return prev.map((v) => false);
                      });
                    }
                  }}
                >
                  <PopoverTrigger>
                    <Button
                      onClick={() =>
                        setIconOpen((prev) => {
                          prev[index] = true;
                          return [...prev];
                        })
                      }
                      size="sm"
                      radius="sm"
                      isIconOnly
                      className="text-xs"
                      variant="flat"
                    >
                      <AccountIconRender
                        icon={
                          iconId[index]
                            ? iconId[index]
                            : "emoji:stuck_out_tongue_winking_eye"
                        }
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    {renderIconPicker(index)}
                  </PopoverContent>
                </Popover>
              }
              placeholder="请输入账户名称"
            />
          </Form.Item>
        </div>

        {(type === "asset" || type === "liability") && (
          <Form.Item
            initialValue={0}
            {...field}
            name={[field.name, "initial_balance"]}
          >
            <Input label="初始金额" radius="sm" type="number" />
          </Form.Item>
        )}
      </div>
    );
  };

  const { isSubmitDisabled } = useFormError(form);

  const setShowBatchAddAccountModal = useSetAtom(ShowBatchAddAccountModalAtom);
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
            <ModalFooter className="justify-between">
              <Button
                color="default"
                variant="flat"
                onPress={() => {
                  setShowBatchAddAccountModal(true);
                  onClose();
                }}
              >
                批量添加
              </Button>
              <div>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !accounts?.some(
                      (account: { name: string }) => account?.name
                    ) || isSubmitDisabled
                  }
                  isLoading={submitLoading}
                  onPress={async () => {
                    await onCreate();
                    form.resetFields();
                    onClose();
                  }}
                >
                  确认
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;
