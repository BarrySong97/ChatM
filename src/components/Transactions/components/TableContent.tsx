import React, { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import { Transaction } from "@db/schema";
import { DatePicker, InputNumber, Tag } from "antd";
import { Select, SelectItem } from "@nextui-org/react";
import dayjs from "dayjs";
import { FinancialOperation } from "@/api/db/manager";
import { operationColors, operationTranslations } from "../contant";
import Decimal from "decimal.js";
import {
  EditTransaction,
  TransactionListParams,
  useTransactionService,
} from "@/api/hooks/transaction";

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
  transactionListParams?: TransactionListParams;
  selectedTransactions: Transaction[];
}

const TableContent: React.FC<TableContentProps> = ({
  transactions,
  transactionListParams,
  assets,
  liabilities,
  incomes,
  expenses,
  onSelectionChanged,
  selectedTransactions,
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
        console.log(onValueChange);

        return (
          <DatePicker
            defaultOpen
            allowClear={false}
            className="w-full outline-none h-[42px] rounded-none"
            getPopupContainer={() =>
              document.getElementById("import-data-table")!
            }
            onChange={(v) => {
              onValueChange(dayjs(v).toDate().getTime());
            }}
            value={dayjs(value)}
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
      cellEditor: ({ value, onValueChange }) => {
        return (
          <div className="flex items-stretch">
            <input
              type="number"
              value={value.toFixed(2)}
              className="w-full outline-none    rounded-none text-right"
              onChange={(v) => {
                onValueChange(Number(v.target.value));
              }}
            />
          </div>
        );
      },
      headerName: "金额",
      cellRenderer: (params: any) => {
        return <div>{params.value.toFixed(2)}</div>;
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

  const { editTransaction } = useTransactionService(transactionListParams);
  const gridRef = useRef<AgGridReact>(null);
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      const api: GridApi = gridRef.current.api;
      api.deselectAll();

      if (selectedTransactions.length > 0) {
        const selectedIds = new Set(selectedTransactions.map((t) => t.id));
        api.forEachNode((node) => {
          if (selectedIds.has(node.data.id)) {
            node.setSelected(true);
          }
        });
      }
    }
  }, [selectedTransactions]);
  return (
    <div className="ag-theme-custom mt-4" style={{ height: 500 }}>
      <AgGridReact
        rowData={transactions}
        ref={gridRef}
        onCellValueChanged={(e) => {
          const editBody = {
            [e.colDef.field as string]: e.newValue,
          };
          console.log(editBody);
          if (e.colDef.field === "transaction_date") {
            editBody.transaction_date = dayjs(e.newValue).toDate().getTime();
          }

          if (e.colDef.field === "amount") {
            editBody.amount = new Decimal(e.newValue).mul(100).toNumber();
          }

          editTransaction({
            transactionId: e.data.id,
            transaction: editBody,
          });
        }}
        onSelectionChanged={(e) => {
          const nodes = e.api.getSelectedNodes();
          const rows = nodes.map((node) => node.data);
          onSelectionChanged(rows);
        }}
        columnDefs={colDefs}
        rowSelection="multiple"
        suppressRowClickSelection={true}
      />
    </div>
  );
};

export default TableContent;
