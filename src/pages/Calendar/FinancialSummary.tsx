import React from "react";
import { FinancialOperation } from "@/api/db/manager";
import { operationColors } from "@/components/Transactions/contant";

interface FinancialSummaryProps {
  expense: number;
  income: number;
  balance: number;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  expense,
  income,
  balance,
}) => {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center ">
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: operationColors[FinancialOperation.Expenditure],
            }}
          ></div>
          <span className="w-7">支出:</span>
        </div>
        <div className="text-left w-10">
          {expense ? expense.toFixed(2) : "0.00"}
        </div>
      </div>
      <div className="flex items-center ">
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: operationColors[FinancialOperation.Income],
            }}
          ></div>
          <span className="w-7">收入:</span>
        </div>
        <div className="text-left w-10">
          {income ? income.toFixed(2) : "0.00"}
        </div>
      </div>
      <div className="flex items-center ">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 invisible"></div>
          <span className="w-7">结余:</span>
        </div>
        <div className="text-left w-10">
          {balance ? balance.toFixed(2) : "0.00"}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
