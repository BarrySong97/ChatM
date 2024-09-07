import React, { FC, useMemo, useRef, useState } from "react";
import { Select, SelectItem, Input } from "@nextui-org/react";
import { useClickAway } from "ahooks";
import { Assets, Expenses, Incomes, Liabilities } from "@db/schema";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import AccountIconRender from "../AccountIconRender";
export interface AccountSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  data?: Assets | Liabilities | Expenses | Incomes;
  type: "assets" | "liabilities" | "expense" | "income";
  placeholder?: string;
  table?: boolean;
  radius?: "sm" | "md" | "lg" | "none";
  onBlur?: () => void;
}
const AccountSelect: FC<AccountSelectProps> = ({
  value,
  onChange,
  data,
  onBlur,
  type,
  placeholder = "选择账户（先选择类型）",
  radius,
  table = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const { createAsset } = useAssetsService();
  const { createLiability } = useLiabilityService();
  const { createExpense } = useExpenseService();
  const { createIncome } = useIncomeService();

  const filteredAccounts = useMemo(() => {
    let filteredLength = 0;
    const temp = data?.map((account) => {
      if (account.name?.toLowerCase().includes(inputValue.toLowerCase())) {
        filteredLength++;
        return (
          <SelectItem key={account.id}>
            <div className="flex items-center gap-2">
              <AccountIconRender icon={account.icon ?? ""} />
              <span>{account.name}</span>
            </div>
          </SelectItem>
        );
      } else {
        return (
          <SelectItem
            classNames={{
              base: "hidden",
            }}
            key={account.id}
          >
            <div className="flex items-center gap-2">
              <AccountIconRender icon={account.icon ?? ""} />
              <span>{account.name}</span>
            </div>
          </SelectItem>
        );
      }
    });
    if (filteredLength === 0 && inputValue) {
      return <SelectItem key="new">新建账户 {inputValue}</SelectItem>;
    }
    return temp;
  }, [data, inputValue]);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(() => {
    onBlur?.();
  }, ref);

  return (
    <Select
      variant={table ? "underlined" : "flat"}
      aria-label="account"
      placeholder={placeholder}
      defaultOpen={table}
      radius={radius}
      listboxProps={{
        topContent: (
          <Input
            placeholder="搜索账户"
            id="account-search"
            size="sm"
            radius="sm"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
        ),
      }}
      fullWidth={!table}
      popoverProps={{
        ref: ref,
        classNames: {
          content: table ? "w-[180px]" : "",
        },
      }}
      renderValue={() => {
        const items = data?.find((account) => account.id === value);
        console.log(items);
        return (
          <div className="flex items-center gap-2">
            <AccountIconRender icon={items?.icon ?? ""} />
            <span>{items?.name}</span>
          </div>
        );
      }}
      classNames={{
        base: table ? "h-[40px] justify-center" : "",
        trigger: table ? "data-[open=true]:after:!hidden h-[38px]" : "",
      }}
      size="sm"
      selectedKeys={value ? [value] : []}
      onSelectionChange={async (e) => {
        if (e instanceof Set) {
          if (e.has("new") && inputValue) {
            // Create new account
            const newAccount = { name: inputValue };
            let res;
            switch (type) {
              case "assets":
                res = await createAsset({
                  asset: { ...newAccount, initial_balance: 0 },
                });
                break;
              case "liabilities":
                res = await createLiability({
                  liability: newAccount,
                });
                break;
              case "expense":
                res = await createExpense({
                  expense: newAccount,
                });
                break;
              case "income":
                res = await createIncome({
                  income: newAccount,
                });
                break;
            }
            if (res) {
              onChange?.(res.id);
            }
          } else {
            onChange?.(Array.from(e)[0] as string);
          }
        }
        setInputValue("");
      }}
    >
      {filteredAccounts ?? []}
    </Select>
  );
};

export default AccountSelect;
