import React from "react";
import {
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Link,
} from "@nextui-org/react";
import { users, statusOptions } from "./data";
import { capitalize } from "./utils";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "./PluseIcon";
import { ConfigProvider, Table, TableProps, Tag } from "antd";
import { Transaction, Transactions } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";

const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

type User = (typeof users)[0];
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
export interface TransactionsTableProps {
  data?: Transactions;
}
import { FinancialOperation } from "@/api/db/manager";
import Decimal from "decimal.js";

const operationColors: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "#4CAF50", // Green
  [FinancialOperation.Expenditure]: "#F44336", // Red
  [FinancialOperation.Transfer]: "#2196F3", // Blue
  [FinancialOperation.RepayLoan]: "#9C27B0", // Purple
  [FinancialOperation.Borrow]: "#FF9800", // Orange
  [FinancialOperation.LoanExpenditure]: "#795548", // Brown
};

const operationTranslations: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "收入",
  [FinancialOperation.Expenditure]: "支出",
  [FinancialOperation.Transfer]: "转账",
  [FinancialOperation.RepayLoan]: "还贷",
  [FinancialOperation.Borrow]: "借款",
  [FinancialOperation.LoanExpenditure]: "贷款支出",
};

export default function TransactionsTable({ data }: TransactionsTableProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(users.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.status)
      );
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User] as number;
      const second = b[sortDescriptor.column as keyof User] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {users.length} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    users.length,
    hasSearchFilter,
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
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();

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
        console.log(value);

        let destination = assets?.find((asset) => asset.id === value)?.name;
        if (!destination) {
          destination = liabilities?.find(
            (liability) => liability.id === value
          )?.name;
        }
        if (!destination) {
          destination = expenses?.find((account) => account.id === value)?.name;
          console.log(destination);
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
          <Table pagination={false} columns={columns} dataSource={data}></Table>
        </ConfigProvider>
      </div>
      {bottomContent}
    </div>
  );
}
