import React, { FC, useMemo, useState } from "react";
import { Select, SelectItem, Input } from "@nextui-org/react";
import { Assets, Expenses, Incomes, Liabilities } from "@db/schema";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
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
        return <SelectItem key={account.id}>{account.name}</SelectItem>;
      } else {
        return (
          <SelectItem
            classNames={{
              base: "hidden",
            }}
            key={account.id}
          >
            {account.name}
          </SelectItem>
        );
      }
    });
    if (filteredLength === 0 && inputValue) {
      return <SelectItem key="new">新建账户 {inputValue}</SelectItem>;
    }
    return temp;
  }, [data, inputValue]);

  return (
    <Select
      variant={table ? "underlined" : "flat"}
      aria-label="account"
      placeholder={placeholder}
      defaultOpen={table}
      radius={radius}
      onBlur={onBlur}
      listboxProps={{
        topContent: (
          <Input
            placeholder="搜索账户"
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
        classNames: {
          content: table ? "w-[180px]" : "",
        },
      }}
      selectionMode="single"
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
