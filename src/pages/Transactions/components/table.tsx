import React, { useState } from "react";
import "./ag-grid-theme-builder.css";
import {
  Input,
  Button,
  Pagination,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { PlusIcon, SearchIcon } from "./PluseIcon";
import { ColDef } from "ag-grid-community";
import { ConfigProvider, DatePicker, Table, TableProps, Tag } from "antd";
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
import TransactionsFilter from "./filter";
import dayjs from "dayjs";
import { AgGridReact } from "ag-grid-react";

const operationColors: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "#4CAF50", // Green
  [FinancialOperation.Expenditure]: "#F44336", // Red
  [FinancialOperation.Transfer]: "#2196F3", // Blue
  [FinancialOperation.RepayLoan]: "#9C27B0", // Purple
  [FinancialOperation.Borrow]: "#FF9800", // Orange
  [FinancialOperation.LoanExpenditure]: "#795548", // Brown
  [FinancialOperation.Refund]: "#FF5722", // Deep Orange
};

export const operationTranslations: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "收入",
  [FinancialOperation.Expenditure]: "支出",
  [FinancialOperation.Transfer]: "转账",
  [FinancialOperation.RepayLoan]: "还贷",
  [FinancialOperation.Borrow]: "借款",
  [FinancialOperation.LoanExpenditure]: "贷款支出",
  [FinancialOperation.Refund]: "退款",
};
export default function TransactionsTable() {
  const [filterValue, setFilterValue] = React.useState("");
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
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
  const [filterConditions, setFilterConditions] = React.useState<"or" | "and">(
    "and"
  );
  const { transactions } = useTransactionService({
    page: page,
    pageSize: rowsPerPage,
    search: filterValue,
    accountId: selectedSource.size > 0 ? Array.from(selectedSource) : undefined,
    type: selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
    minAmount: minAmount,
    maxAmount: maxAmount,
    startDate: startDate ? startDate.getTime() : undefined,
    endDate: endDate ? endDate.getTime() : undefined,
    filterConditions: filterConditions,
  });

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );
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
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
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
            <div className="flex items-center gap-4">
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
              <div className="flex gap-0 items-center text-default-400 text-small">
                <div>满足</div>
                <select
                  className="bg-transparent outline-none text-default-400 text-small"
                  onChange={(e) => {
                    setFilterConditions(e.target.value as "and" | "or");
                  }}
                >
                  <option value="and">所有</option>
                  <option value="or">任一</option>
                </select>
                <div>条件</div>
              </div>
            </div>
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
          <div className="flex gap-2">
            <span className="text-default-400 text-small">
              共 {transactions?.totalCount ?? 0} 条流水
            </span>
            <span className="text-small text-default-400">
              {`${selectedRows.length} of ${
                transactions?.list.length ?? 0
              } selected`}
            </span>
          </div>
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
    selectedRows,
  ]);

  const bottomContent = React.useMemo(() => {
    return transactions ? (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          size="sm"
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={page}
          initialPage={1}
          total={transactions?.totalPages ? transactions.totalPages : 1}
          variant="light"
          onChange={setPage}
        />
      </div>
    ) : null;
  }, [transactions, page]);

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
              onClick={() => {
                selectedTypes.add(value);
                setSelectedTypes(new Set(selectedTypes));
              }}
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
              onClick={() => {
                selectedSource.add(value);
                setSelectedSource(new Set(selectedSource));
              }}
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
              onClick={() => {
                selectedSource.add(value);
                setSelectedSource(new Set(selectedSource));
              }}
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

  const [colDefs, setColDefs] = useState<ColDef<Transaction>[]>([
    {
      field: "id",
      headerName: "",
      width: 36,
      resizable: false,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
    },
    {
      field: "transaction_date",
      headerName: "日期",
      width: 120,
      editable: true,
      cellEditor: ({ value, onValueChange }) => {
        const date = typeof value === "string" ? dayjs(value) : value;

        return (
          <DatePicker
            defaultOpen
            allowClear={false}
            className="w-full outline-none h-[42px] rounded-none"
            getPopupContainer={() =>
              document.getElementById("import-data-table")!
            }
            onChange={(v) => {
              onValueChange(v.toString());
            }}
            value={date}
          />
        );
      },
      valueFormatter: (params) => {
        return dayjs(params.value).format("YYYY-MM-DD");
      },
    },
    {
      field: "content",
      width: 200,
      editable: true,
      headerName: "交易内容",
    },
    {
      field: "amount",
      type: "rightAligned",
      width: 100,
      editable: true,
      headerName: "金额",
    },
    {
      field: "type",
      width: 110,
      headerName: "类型",
      editable: true,
      cellEditor: ({ value, onValueChange, data }) => {
        return (
          <Select
            items={Object.values(FinancialOperation).map((type) => ({
              label: operationTranslations[type],
              value: type,
            }))}
            variant="underlined"
            defaultOpen
            radius="none"
            classNames={{
              trigger: "data-[open=true]:after:!hidden",
            }}
            selectionMode="single"
            selectedKeys={new Set([value])}
            onSelectionChange={(v) => {
              onValueChange(Array.from(v)[0]);
            }}
          >
            {(item) => {
              return <SelectItem key={item.value}>{item.label}</SelectItem>;
            }}
          </Select>
        );
      },
      cellRenderer: (params: any) => {
        const { data } = params;
        const color = operationColors[params.value as FinancialOperation];
        const text = operationTranslations[params.value as FinancialOperation];
        return (
          <Tag
            className="mr-0 hover:cursor-pointer"
            color={color}
            bordered={false}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      field: "source_account_id",
      headerName: "来源账户",
      width: 100,
      editable: true,
      cellRenderer: (params: any) => {
        const { data } = params;
        let source = assets?.find((asset) => asset.id === params.value)?.name;
        if (!source) {
          source = liabilities?.find(
            (liability) => liability.id === params.value
          )?.name;
        }
        if (!source) {
          source = incomes?.find((income) => income.id === params.value)?.name;
        }
        if (!source) {
          source = expenses?.find(
            (expense) => expense.id === params.value
          )?.name;
        }

        return (
          <Tag
            className="mr-0 hover:cursor-pointer"
            color="processing"
            bordered={false}
          >
            {source}
          </Tag>
        );
      },
      cellEditor: ({ value, onValueChange, data }) => {
        return (
          <Select
            items={[
              ...assets?.map((asset) => ({
                label: asset.name,
                value: asset.id,
              })),
              ...liabilities?.map((liability) => ({
                label: liability.name,
                value: liability.id,
              })),
              ...incomes?.map((income) => ({
                label: income.name,
                value: income.id,
              })),
              ...expenses?.map((expense) => ({
                label: expense.name,
                value: expense.id,
              })),
            ]}
            variant="underlined"
            defaultOpen
            radius="none"
            classNames={{
              trigger: "data-[open=true]:after:!hidden",
            }}
            selectionMode="single"
            selectedKeys={new Set([value])}
            onSelectionChange={(v) => {
              onValueChange(Array.from(v)[0]);
            }}
          >
            {(item) => {
              return <SelectItem key={item.value}>{item.label}</SelectItem>;
            }}
          </Select>
        );
      },
    },
    {
      field: "destination_account_id",
      headerName: "目标账户",
      width: 100,
      editable: true,
      cellRenderer: (params: any) => {
        const { data } = params;
        let destination = expenses?.find(
          (expense) => expense.id === params.value
        )?.name;
        if (!destination) {
          destination = incomes?.find(
            (income) => income.id === params.value
          )?.name;
        }
        if (!destination) {
          destination = assets?.find(
            (asset) => asset.id === params.value
          )?.name;
        }
        if (!destination) {
          destination = liabilities?.find(
            (liability) => liability.id === params.value
          )?.name;
        }
        return (
          <Tag
            className="mr-0 hover:cursor-pointer"
            color="processing"
            bordered={false}
          >
            {destination}
          </Tag>
        );
      },
      cellEditor: ({ value, onValueChange, data }) => {
        return (
          <Select
            items={[
              ...assets?.map((asset) => ({
                label: asset.name,
                value: asset.id,
              })),
              ...liabilities?.map((liability) => ({
                label: liability.name,
                value: liability.id,
              })),
              ...incomes?.map((income) => ({
                label: income.name,
                value: income.id,
              })),
              ...expenses?.map((expense) => ({
                label: expense.name,
                value: expense.id,
              })),
            ]}
            variant="underlined"
            defaultOpen
            radius="none"
            classNames={{
              trigger: "data-[open=true]:after:!hidden",
            }}
            selectionMode="single"
            selectedKeys={new Set([value])}
            onSelectionChange={(v) => {
              onValueChange(Array.from(v)[0]);
            }}
          >
            {(item) => {
              return <SelectItem key={item.value}>{item.label}</SelectItem>;
            }}
          </Select>
        );
      },
    },
    {
      field: "tags",
      headerName: "标签",
      editable: true,
    },
    {
      field: "remark",
      headerName: "备注",
      editable: true,
    },
  ]);
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
          <div
            className="ag-theme-custom mt-4" // applying the Data Grid theme
            style={{ height: 500 }} // the Data Grid will fill the size of the parent container
          >
            <AgGridReact
              rowData={transactions?.list ?? []}
              onSelectionChanged={(e) => {
                const nodes = e.api.getSelectedNodes();
                const rows = nodes.map((node) => node.data);
                setSelectedRows(rows);
              }}
              rowSelection={"multiple"}
              columnDefs={colDefs}
              suppressRowClickSelection={true}
            />
          </div>
        </ConfigProvider>
      </div>
      {bottomContent}
    </div>
  );
}
