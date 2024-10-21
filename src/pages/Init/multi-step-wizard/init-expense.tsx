import { useAssetsService } from "@/api/hooks/assets";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import AccountIconRender from "@/components/AccountIconRender";
import AccountModal from "@/components/AccountModal";
import { Asset, Expense, Income } from "@db/schema";
import { Icon } from "@iconify/react";
import { Button, Chip } from "@nextui-org/react";
import React, { FC, useState } from "react";
export interface InitExpenseProps {}
const InitExpense: FC<InitExpenseProps> = () => {
  const { expenses, deleteExpense } = useExpenseService();
  const [selectedExpenses, setSelectedExpenses] = useState<Expense>();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="max-auto">
      <div className="text-3xl font-bold leading-9  text-default-foreground">
        添加你的支出
      </div>
      <div className="py-2 text-medium text-default-500 mb-8">
        <p>你可以在这里添加你的支出</p>
        <p>如吃饭，购物，娱乐，交通，医疗等</p>
      </div>
      <div className="flex flex-wrap  gap-3 gap-y-4">
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
          size="sm"
          color="primary"
          className="rounded-2xl gap-0.5"
          endContent={
            <Icon
              icon="material-symbols-light:add-circle-rounded"
              className="text-lg "
            />
          }
          variant="flat"
        >
          新增收入
        </Button>
        {expenses?.map((expense) => {
          return (
            <Button
              key={expense.name}
              onClick={() => {
                setSelectedExpenses(expense);
                setIsOpen(true);
              }}
              startContent={<AccountIconRender icon={expense.icon || ""} />}
              size="sm"
              endContent={
                <Icon
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteExpense(expense.id);
                  }}
                  icon="material-symbols-light:cancel"
                  className="text-lg "
                />
              }
              className="rounded-2xl gap-0.5"
              variant="flat"
            >
              {expense.name}
            </Button>
          );
        })}
      </div>
      <AccountModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        type="expense"
        data={selectedExpenses}
      />
    </div>
  );
};

export default InitExpense;
