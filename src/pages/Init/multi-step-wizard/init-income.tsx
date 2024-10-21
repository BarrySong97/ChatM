import { useAssetsService } from "@/api/hooks/assets";
import { useIncomeService } from "@/api/hooks/income";
import AccountIconRender from "@/components/AccountIconRender";
import AccountModal from "@/components/AccountModal";
import { Asset, Income } from "@db/schema";
import { Icon } from "@iconify/react";
import { Button, Chip } from "@nextui-org/react";
import React, { FC, useState } from "react";
export interface InitAssetsProps {}
const InitIncome: FC<InitAssetsProps> = () => {
  const { incomes, deleteIncome } = useIncomeService();
  const [selectedIncomes, setSelectedIncomes] = useState<Income>();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="max-auto">
      <div className="text-3xl font-bold leading-9  text-default-foreground">
        添加你的收入
      </div>
      <div className="py-2 text-medium text-default-500 mb-8">
        <p>你可以在这里添加你的收入</p>
        <p>如工资，奖金，投资收益，租金收入等</p>
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
        {incomes?.map((income) => {
          return (
            <Button
              key={income.name}
              onClick={() => {
                setSelectedIncomes(income);
                setIsOpen(true);
              }}
              startContent={<AccountIconRender icon={income.icon || ""} />}
              size="sm"
              endContent={
                <Icon
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteIncome(income.id);
                  }}
                  icon="material-symbols-light:cancel"
                  className="text-lg "
                />
              }
              className="rounded-2xl gap-0.5"
              variant="flat"
            >
              {income.name}
            </Button>
          );
        })}
      </div>
      <AccountModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        type="income"
        data={selectedIncomes}
      />
    </div>
  );
};

export default InitIncome;
