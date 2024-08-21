import React from "react";
import { Input, Button, Pagination, Link } from "@nextui-org/react";
import { ConfigProvider, Table, TableProps, Tag } from "antd";
import { Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";

export interface TransactionsTableProps {
  data?: Page<Transaction>;
}
import { FinancialOperation } from "@/api/db/manager";
import Decimal from "decimal.js";
import { Page } from "@/api/models/Page";
import { useTransactionService } from "@/api/hooks/transaction";
import dayjs from "dayjs";

const operationColors: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "#4CAF50", // Green
  [FinancialOperation.Expenditure]: "#F44336", // Red
  [FinancialOperation.Transfer]: "#2196F3", // Blue
  [FinancialOperation.RepayLoan]: "#9C27B0", // Purple
  [FinancialOperation.Borrow]: "#FF9800", // Orange
  [FinancialOperation.LoanExpenditure]: "#795548", // Brown
};

export const operationTranslations: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "收入",
  [FinancialOperation.Expenditure]: "支出",
  [FinancialOperation.Transfer]: "转账",
  [FinancialOperation.RepayLoan]: "还贷",
  [FinancialOperation.Borrow]: "借款",
  [FinancialOperation.LoanExpenditure]: "贷款支出",
};
export interface TransactionsTableProps {
  accountId?: string;
}
export default function CategoryTransactionsTable({
  accountId,
}: TransactionsTableProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const { transactions } = useTransactionService({
    page: page,
    pageSize: rowsPerPage,
    accountId: accountId ? [accountId] : undefined,
  });
  console.log(transactions, accountId);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 justify-between items-center">
          <div className="text-lg font-bold">流水数据</div>
          <Button className="bg-foreground text-background" size="sm">
            添加流水
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            共 {transactions?.totalCount ?? 0} 条流水
          </span>
          <label className="flex items-center text-default-400 text-small">
            每页:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10条</option>
              <option value="15">15条</option>
              <option value="20">20条</option>
              <option value="25">25条</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [transactions]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          size="sm"
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={transactions?.currentPage ?? 1}
          total={transactions?.totalPages ?? 0}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {`0 of ${transactions?.list.length ?? 0} selected`}
        </span>
      </div>
    );
  }, [transactions]);

  const columns: TableProps<Transaction>["columns"] = [
    {
      title: "日期",
      dataIndex: "transaction_date",
      key: "transaction_date",
      width: 100,
      render(value, record, index) {
        return <div>{new Date(value).toLocaleDateString()}</div>;
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 60,
      render(value, record, index) {
        const color = operationColors[value as FinancialOperation];
        const text = operationTranslations[value as FinancialOperation];
        return (
          <div>
            <Tag
              className="hover:cursor-pointer"
              color={color}
              bordered={false}
            >
              {text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "内容",
      dataIndex: "content",
      width: 200,
      key: "content",
      render(value, record, index) {
        return <div>{value}</div>;
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      align: "right",
      key: "amount",
      render(value, record, index) {
        const real = new Decimal(value).div(100);
        return <div>{real.toString()}</div>;
      },
    },
    {
      title: "来源",
      dataIndex: "source_account_id",
      key: "source",
      align: "right",
      render(value) {
        let source = assets?.find((asset) => asset.id === value)?.name;
        if (!source) {
          source = liabilities?.find(
            (liability) => liability.id === value
          )?.name;
        }
        if (!source) {
          source = expenses?.find((account) => account.id === value)?.name;
        }

        if (!source) {
          source = incomes?.find((income) => income.id === value)?.name;
        }

        return (
          <div>
            <Tag
              className="mr-0 hover:cursor-pointer"
              color="processing"
              bordered={false}
            >
              {source}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "流向",
      dataIndex: "destination_account_id",
      key: "destination_account_id",
      align: "right",
      render(value) {
        let destination = assets?.find((asset) => asset.id === value)?.name;
        if (!destination) {
          destination = liabilities?.find(
            (liability) => liability.id === value
          )?.name;
        }
        if (!destination) {
          destination = expenses?.find((account) => account.id === value)?.name;
        }
        if (!destination) {
          destination = incomes?.find((income) => income.id === value)?.name;
        }
        return (
          <div>
            <Tag
              className="mr-0 hover:cursor-pointer"
              color="processing"
              bordered={false}
            >
              {destination}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "#标签",
      dataIndex: "tags",
      key: "tags",
      align: "center",
      render(value: string, record, index) {
        return (
          <div className="">
            {value &&
              value.split(" ").map((tag, index) => (
                <Link
                  key={index}
                  size="sm"
                  href="#"
                  underline="always"
                  className="mr-1"
                >
                  {tag.trim()}
                </Link>
              ))}
          </div>
        );
      },
    },
    {
      title: "补充",
      dataIndex: "remark",
      key: "remark",
      align: "right",
      render(value, record, index) {
        return <div>{value}</div>;
      },
    },
  ];

  return (
    <div>
      {topContent}
      <div className="transactions-table">
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "transparent",
                headerSplitColor: "transparent",
              },
            },
          }}
        >
          <Table
            pagination={false}
            columns={columns}
            rowKey={"id"}
            dataSource={transactions?.list}
          ></Table>
        </ConfigProvider>
      </div>
      {bottomContent}
    </div>
  );
}
