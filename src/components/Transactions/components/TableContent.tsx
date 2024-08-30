import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Transaction } from "@db/schema";
import { DatePicker, Tag } from "antd";
import { Select, SelectItem } from "@nextui-org/react";
import dayjs from "dayjs";
import { FinancialOperation } from "@/api/db/manager";
import { operationColors, operationTranslations } from "../contant";
import Decimal from "decimal.js";

interface TableContentProps {
  transactions: Transaction[];
  assets: any[];
  liabilities: any[];
  incomes: any[];
  expenses: any[];
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  totalPages: number;
  totalCount: number;
  onSelectionChanged: (rows: Transaction[]) => void;
}

const TableContent: React.FC<TableContentProps> = ({
  transactions,
  assets,
  liabilities,
  incomes,
  expenses,
  onSelectionChanged,
  pageSize,
  onPageSizeChange,
  totalPages,
  totalCount,
}) => {
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
        console.log(value, onValueChange);

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
      cellRenderer: (params: any) => {
        const { data } = params;
        return (
          <div>
            {new Decimal(data.amount).dividedBy(100).toNumber().toFixed(2)}
          </div>
        );
      },
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
    <div className="ag-theme-custom mt-4" style={{ height: 500 }}>
      <AgGridReact
        rowData={transactions}
        onSelectionChanged={(e) => {
          const nodes = e.api.getSelectedNodes();
          const rows = nodes.map((node) => node.data);
          onSelectionChanged(rows);
        }}
        columnDefs={colDefs}
        suppressRowClickSelection={true}
      />
    </div>
  );
};

export default TableContent;
