import React from "react";
import { useDebounce } from "ahooks";
import {
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Selection,
  SortDescriptor,
  Link,
  Tooltip,
  Select,
  SelectItem,
  Listbox,
  ListboxItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  ListboxSection,
  DatePicker,
} from "@nextui-org/react";
import { statusOptions } from "./data";
import { capitalize } from "./utils";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "./PluseIcon";
import { ConfigProvider, Table, TableProps, Tag } from "antd";
import { Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";

const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
export interface TransactionsTableProps {
  data?: Page<Transaction>;
}
import { FinancialOperation } from "@/api/db/manager";
import Decimal from "decimal.js";
import { Page } from "@/api/models/Page";
import { useTransactionService } from "@/api/hooks/transaction";
import TransactionsFilter from "./filter";
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
export default function TransactionsTable() {
  const [filterValue, setFilterValue] = React.useState("");
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const debouncedValue = useDebounce(filterValue, { wait: 500 });
  const { transactions } = useTransactionService({
    page: page,
    pageSize: rowsPerPage,
    search: debouncedValue as unknown as string,
  });

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );
  const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(
    new Set()
  );
  const [selectedSource, setSelectedSource] = React.useState<Set<string>>(
    new Set()
  );
  const [minAmount, setMinAmount] = React.useState<number>(0);
  const [maxAmount, setMaxAmount] = React.useState<number>(0);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  console.log(selectedSource);

  const getName = (id: string) =>
    [assets, liabilities, expenses, incomes].map((item) => {
      return item?.find((item) => item.id === id)?.name;
    });
  const renderFilterConditions = () => {
    const types = Array.from(selectedTypes);
    const sources = Array.from(selectedSource);
    return (
      <div className="space-y-2">
        {types.map((type) => {
          return (
            <Tag
              bordered={false}
              closable
              onClose={() => {
                setSelectedTypes(new Set(types.filter((t) => t !== type)));
              }}
              color={operationColors[type as FinancialOperation]}
            >
              {operationTranslations[type as FinancialOperation]}
            </Tag>
          );
        })}
        {sources.map((source) => (
          <Tag
            closable
            onClose={() => {
              setSelectedSource(new Set(sources.filter((s) => s !== source)));
            }}
            bordered={false}
          >
            {getName(source)}
          </Tag>
        ))}
        {minAmount || maxAmount ? (
          <Tag
            onClose={() => {
              setMinAmount(0);
              setMaxAmount(0);
            }}
            closable
            bordered={false}
          >
            金额: {minAmount ? minAmount : "不限"} -{" "}
            {maxAmount ? maxAmount : "不限"}
          </Tag>
        ) : null}

        {startDate || endDate ? (
          <Tag
            closable
            onClose={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            bordered={false}
          >
            日期：{startDate ? dayjs(startDate).format("YYYY-MM-DD") : "不限"} -{" "}
            {endDate ? dayjs(endDate).format("YYYY-MM-DD") : "目前"}
          </Tag>
        ) : null}
      </div>
    );
  };
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-3">
            <Input
              isClearable
              classNames={{
                base: "w-[300px]",
                inputWrapper: "border-1",
              }}
              placeholder="搜索流水内容"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                }
              }}
              size="sm"
              startContent={<SearchIcon className="text-default-300" />}
              value={filterValue}
              variant="bordered"
              onClear={() => setFilterValue("")}
              onValueChange={(v) => {
                setFilterValue(v);
                setPage(1);
              }}
            />
            <TransactionsFilter
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              minAmount={minAmount}
              setMinAmount={setMinAmount}
              maxAmount={maxAmount}
              setMaxAmount={setMaxAmount}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              incomes={incomes}
              expenses={expenses}
              assets={assets}
              liabilities={liabilities}
            />
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              添加流水
            </Button>
          </div>
        </div>
        {renderFilterConditions()}
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
  }, [
    transactions,
    selectedTypes,
    selectedSource,
    minAmount,
    maxAmount,
    startDate,
    endDate,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
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
            <Tag color={color} bordered={false}>
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
            <Tag className="mr-0" color="processing" bordered={false}>
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
            <Tag className="mr-0" color="processing" bordered={false}>
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
            dataSource={transactions?.list}
          ></Table>
        </ConfigProvider>
      </div>
      {bottomContent}
    </div>
  );
}
