import React, { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useClickAway } from "ahooks";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
  Asset,
  Expense,
  Income,
  Liability,
  Tags,
  Transaction,
} from "@db/schema";
import { DatePicker, InputNumber, Tag } from "antd";
import { Select, SelectItem, SelectSection } from "@nextui-org/react";
import dayjs from "dayjs";
import { FinancialOperation } from "@/api/db/manager";
import { operationColors, operationTranslations } from "../contant";
import Decimal from "decimal.js";
import {
  TransactionListParams,
  useTransactionService,
} from "@/api/hooks/transaction";
import AccountSelect from "@/components/AccountSelect";
import TagInput from "@/components/TagInput";
import { useTagService } from "@/api/hooks/tag";

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
  const renderSource = (type: FinancialOperation) => {
    switch (type) {
      case FinancialOperation.RepayLoan:
        return ["assets", assets];
      case FinancialOperation.Income:
        return ["incomes", incomes];
      case FinancialOperation.Expenditure:
        return ["assets", assets];
      case FinancialOperation.Transfer:
        return ["assets", assets];
      case FinancialOperation.Borrow:
        return ["liabilities", liabilities];
      case FinancialOperation.LoanExpenditure:
        return ["liabilities", liabilities];
      case FinancialOperation.Refund:
        return ["expenses", expenses];
      default:
        return ["", null];
    }
  };
  const renderDestination = (type: FinancialOperation) => {
    switch (type) {
      case FinancialOperation.Income:
        return ["assets", assets];
      case FinancialOperation.Expenditure:
        return ["expenses", expenses];
      case FinancialOperation.Transfer:
        return ["assets", assets];
      case FinancialOperation.RepayLoan:
        return ["liabilities", liabilities];
      case FinancialOperation.Borrow:
        return ["assets", assets];
      case FinancialOperation.LoanExpenditure:
        return ["expenses", expenses];
      case FinancialOperation.Refund:
        return ["assets", assets];
      default:
        return ["", null];
    }
  };
  const asssetsRef = useRef<Asset[]>([]);
  const liabilitiesRef = useRef<Liability[]>([]);
  const incomesRef = useRef<Income[]>([]);
  const expensesRef = useRef<Expense[]>([]);
  asssetsRef.current = assets;
  liabilitiesRef.current = liabilities;

  const { tags } = useTagService();
  const [colDefs, setColDefs] = useState<
    ColDef<
      Transaction & {
        transactionTags: {
          tag: { name: string; id: string };
        };
      }
    >[]
  >([
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
      cellEditor: ({ value, onValueChange, api }) => {
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
            onBlur={() => {
              api.stopEditing();
            }}
            selectionMode="single"
            selectedKeys={new Set([value])}
            onSelectionChange={(v) => {
              onValueChange(Array.from(v)[0]);
              api.stopEditing();
            }}
          >
            {(item) => {
              return <SelectItem key={item.value}>{item.label}</SelectItem>;
            }}
          </Select>
        );
      },
      cellRenderer: (params: any) => {
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
        let source = asssetsRef.current?.find(
          (asset) => asset.id === params.value
        )?.name;
        if (!source) {
          source = liabilitiesRef.current?.find(
            (liability) => liability.id === params.value
          )?.name;
        }
        if (!source) {
          source = incomesRef.current?.find(
            (income) => income.id === params.value
          )?.name;
        }
        if (!source) {
          source = expensesRef.current?.find(
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
      cellEditor: ({ value, onValueChange, data, api }) => {
        const source = renderSource(data.type);
        return (
          <AccountSelect
            radius="none"
            type={source[0] as any}
            data={source[1] as any}
            onBlur={() => {
              api.stopEditing();
            }}
            value={value}
            table
            onChange={(v) => {
              onValueChange(v);
              api.stopEditing();
            }}
          />
        );
      },
    },
    {
      field: "destination_account_id",
      headerName: "目标账户",
      width: 100,
      editable: true,
      cellRenderer: (params: any) => {
        let destination = expensesRef.current?.find(
          (expense) => expense.id === params.value
        )?.name;
        if (!destination) {
          destination = incomesRef.current?.find(
            (income) => income.id === params.value
          )?.name;
        }
        if (!destination) {
          destination = asssetsRef.current?.find(
            (asset) => asset.id === params.value
          )?.name;
        }
        if (!destination) {
          destination = liabilitiesRef.current?.find(
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
      cellEditor: ({ value, onValueChange, data, api }) => {
        const destination = renderDestination(data.type);
        return (
          <AccountSelect
            type={destination[0] as any}
            data={destination[1] as any}
            radius="none"
            onBlur={() => {
              api.stopEditing();
            }}
            table
            value={value}
            onChange={(v) => {
              onValueChange(v);
              api.stopEditing();
            }}
          />
        );
      },
    },
    {
      field: "transactionTags",
      headerName: "标签",
      editable: true,
      cellRenderer: (params: any) => {
        return params.value
          .map((tag: { tag: { name: string; id: string } }) => {
            if (tag.tag) {
              return `#${tag.tag.name}`;
            }
            const name = tags?.find(
              (t) => t.id === (tag as unknown as string)
            )?.name;
            return name ? `#${name}` : "";
          })
          .join(" ");
      },
      cellEditor: ({ value, onValueChange, api }) => {
        const ids = value.map((v: { tag: { id: string } }) => {
          if (v.tag) {
            return v.tag.id;
          }
          return v;
        });
        return (
          <TagInput
            onBlur={() => {
              api.stopEditing();
            }}
            table
            value={ids}
            onChange={(v) => {
              onValueChange(v);
            }}
          />
        );
      },
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
      const nodes = api.getSelectedNodes();
      if (selectedTransactions.length == 0 && nodes.length > 0) {
        api.deselectAll();
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

          if (e.colDef.field === "transactionTags") {
            editBody.tags = e.newValue;
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
