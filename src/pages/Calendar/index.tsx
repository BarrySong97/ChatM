import { FinancialOperation } from "@/api/db/manager";
import { TransactionService } from "@/api/services/TransactionService";
import { PageWrapper } from "@/components/PageWrapper";
import { operationColors } from "@/components/Transactions/contant";
import { BookAtom } from "@/globals";
import { Transaction } from "@db/schema";
import { Divider } from "@nextui-org/react";
import { Calendar as AntdCalendar, ConfigProvider } from "antd";
import locale from "antd/locale/zh_CN";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import { useAtomValue } from "jotai";
import React, { FC, useMemo, useState } from "react";
import { useQuery } from "react-query";
import FinancialSummary from "./FinancialSummary";

dayjs.locale("zh-cn");
const now = dayjs();
const Calendar: FC = () => {
  const [month, setMonth] = useState(now);
  const monthString = month.format("YYYY-MM");
  const [mode, setMode] = useState<"month" | "year">("month");
  const book = useAtomValue(BookAtom);
  const { data: transactions } = useQuery({
    queryKey: ["transactions", monthString, book?.id, mode],
    enabled: !!book,
    queryFn: () =>
      TransactionService.getTransactionByMonth(
        month.toDate().getTime(),
        book?.id || "",
        mode
      ),
  });
  const getIncome = (transactions: Transaction[]) => {
    const incomeMap = new Map<string, number>();
    transactions.forEach((transaction) => {
      const date = dayjs(transaction.transaction_date).format("YYYY-MM-DD");
      if (transaction.type === FinancialOperation.Income) {
        const currentAmount = incomeMap.get(date) || 0;
        incomeMap.set(date, currentAmount + (transaction.amount || 0));
      }
    });
    return incomeMap;
  };
  const getExpense = (transactions: Transaction[]) => {
    const expenseMap = new Map<string, number>();
    transactions.forEach((transaction) => {
      const date = dayjs(transaction.transaction_date).format("YYYY-MM-DD");
      if (transaction.type === FinancialOperation.Expenditure) {
        const currentAmount = expenseMap.get(date) || 0;
        expenseMap.set(date, currentAmount + (transaction.amount || 0));
      }
    });
    return expenseMap;
  };
  const incomeMap = useMemo(
    () => getIncome(transactions || []),
    [transactions]
  );
  const expenseMap = useMemo(
    () => getExpense(transactions || []),
    [transactions]
  );
  const dateCellRender = (value: Dayjs) => {
    const expense = expenseMap.get(value.format("YYYY-MM-DD")) || 0;
    const income = incomeMap.get(value.format("YYYY-MM-DD")) || 0;
    const balance = income - expense;
    if (!expense && !income) return null;
    return (
      <FinancialSummary expense={expense} income={income} balance={balance} />
    );
  };
  const monthCellRender = (current: Dayjs) => {
    const currentMonth = dayjs(current).month();

    const monthExpenseSum = Array.from(expenseMap.entries())
      .filter(([date]) => dayjs(date).month() === currentMonth)
      .reduce((sum, [, value]) => sum + value, 0);
    const monthIncomeSum = Array.from(incomeMap.entries())
      .filter(([date]) => dayjs(date).month() === currentMonth)
      .reduce((sum, [, value]) => sum + value, 0);
    const monthBalance = monthIncomeSum - monthExpenseSum;
    return (
      <FinancialSummary
        expense={monthExpenseSum}
        income={monthIncomeSum}
        balance={monthBalance}
      />
    );
  };
  const cellRender = (current: Dayjs, info: any) => {
    if (info.type === "date") return dateCellRender(current);
    return (
      <div className="flex gap-4">
        {info.originNode}
        {monthCellRender(current)}
      </div>
    );
  };
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">日历</h1>
        </div>
      </div>
      <Divider className="my-6" />
      <ConfigProvider locale={locale}>
        <AntdCalendar
          cellRender={cellRender}
          onPanelChange={(_, mode) => setMode(mode)}
          onChange={(value) => setMonth(value)}
        />
      </ConfigProvider>
    </PageWrapper>
  );
};

export default Calendar;
