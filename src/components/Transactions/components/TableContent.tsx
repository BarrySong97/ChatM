import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
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
import {
  Chip,
  Select,
  SelectItem,
  SelectSection,
  Spinner,
} from "@nextui-org/react";
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
import AccountIconRender from "@/components/AccountIconRender";
import { useQueryClient } from "react-query";

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
  onRowEdit?: (row: any, rowIndex: number) => void;
  selectedTransactions: Transaction[];
  importTable?: boolean;
  isContentWrap?: boolean;
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
  importTable = false,
  onRowEdit,
  isContentWrap = false,
}) => {
  const { tags } = useTagService();
  const asssetsRef = useRef<Asset[]>([]);
  const liabilitiesRef = useRef<Liability[]>([]);
  const incomesRef = useRef<Income[]>([]);
  const expensesRef = useRef<Expense[]>([]);
  const tagsRef = useRef<Tags>([]);
  asssetsRef.current = assets;
  expensesRef.current = expenses;
  incomesRef.current = incomes;
  liabilitiesRef.current = liabilities;
  tagsRef.current = tags ?? [];
  const renderSource = (type: FinancialOperation) => {
    switch (type) {
      case FinancialOperation.RepayLoan:
        return ["asset", asssetsRef.current];
      case FinancialOperation.Income:
        return ["income", incomesRef.current];
      case FinancialOperation.Expenditure:
        return ["asset", asssetsRef.current];
      case FinancialOperation.Transfer:
        return ["asset", asssetsRef.current];
      case FinancialOperation.Borrow:
        return ["liability", liabilitiesRef.current];
      case FinancialOperation.LoanExpenditure:
        return ["liability", liabilitiesRef.current];
      case FinancialOperation.Refund:
        return ["expense", expensesRef.current];
      case FinancialOperation.LoanRefund:
        return ["liability", liabilitiesRef.current];
      default:
        return ["", null];
    }
  };
  const renderDestination = (type: FinancialOperation) => {
    switch (type) {
      case FinancialOperation.Income:
        return ["asset", asssetsRef.current];
      case FinancialOperation.Expenditure:
        return ["expense", expensesRef.current];
      case FinancialOperation.Transfer:
        return ["asset", asssetsRef.current];
      case FinancialOperation.RepayLoan:
        return ["liability", liabilitiesRef.current];
      case FinancialOperation.Borrow:
        return ["asset", asssetsRef.current];
      case FinancialOperation.LoanExpenditure:
        return ["expense", expensesRef.current];
      case FinancialOperation.Refund:
        return ["asset", asssetsRef.current];
      case FinancialOperation.LoanRefund:
        return ["expense", expensesRef.current];
      default:
        return ["", null];
    }
  };

  const contentWrap = {
    autoHeight: true,
    wrapText: true,
    cellStyle: {
      whiteSpace: "normal",
      lineHeight: "24px",
      // height: "120px",
      // padding: "0.5rem 0.5rem",
    },
  };
  const queryClient = useQueryClient();
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
      editable: (params) => {
        return params.data?.type !== "loading";
      },
      cellEditor: ({ value, onValueChange }) => {
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
      width: 400,
      editable: (params) => {
        return params.data?.type !== "loading";
      },
      headerName: "交易内容",
      ...(isContentWrap ? contentWrap : {}),
    },
    {
      field: "amount",
      type: "rightAligned",
      width: 100,
      editable: (params) => {
        return params.data?.type !== "loading";
      },
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
        return (
          <div className="flex items-center justify-end h-full">
            <div>{params.value?.toFixed(2)}</div>
          </div>
        );
      },
    },
    {
      field: "type",
      width: 110,
      headerName: "类型",
      editable: (params) => {
        return params.data?.type !== "loading";
      },
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
            fullWidth={false}
            classNames={{
              trigger: "data-[open=true]:after:!hidden",
              base: "w-[130px]",
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
              return (
                <SelectItem key={item.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: operationColors[item.value] }}
                    ></div>
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              );
            }}
          </Select>
        );
      },
      cellRenderer: (params: any) => {
        const color = operationColors[params?.value as FinancialOperation];
        const text = operationTranslations[params?.value as FinancialOperation];
        if (params?.data?.status) {
          return (
            <div className="flex items-center  h-full">
              <Spinner size="sm" />
            </div>
          );
        }

        return text ? (
          <div className="flex items-center  h-full">
            <Chip
              radius="sm"
              size="sm"
              variant="flat"
              // color={}
            >
              <div className="flex items-center gap-1 ">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                ></div>
                <div>{text}</div>
              </div>
            </Chip>
          </div>
        ) : (
          ""
        );
      },
    },
    {
      field: "source_account_id",
      headerName: "来源账户",
      width: 130,
      editable: (params) => {
        return params.data?.type !== "loading";
      },
      cellRenderer: (params: any) => {
        if (params?.data?.status) {
          return (
            <div className="flex items-center  h-full">
              <Spinner size="sm" />
            </div>
          );
        }
        let source: any = asssetsRef.current?.find(
          (asset) => asset.id === params?.value
        );
        if (!source) {
          source = liabilitiesRef.current?.find(
            (liability) => liability.id === params?.value
          );
        }
        if (!source) {
          source = incomesRef.current?.find(
            (income) => income.id === params?.value
          );
        }
        if (!source) {
          source = expensesRef.current?.find(
            (expense) => expense.id === params?.value
          );
        }

        return source ? (
          <div className="flex items-center  h-full">
            <Chip radius="sm" size="sm" variant="flat" color="default">
              <div className="flex items-center gap-1">
                <AccountIconRender icon={source?.icon} />
                <span>{source?.name}</span>
              </div>
            </Chip>
          </div>
        ) : (
          ""
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
      editable: (params) => {
        return params.data?.type !== "loading";
      },
      width: 130,
      cellRenderer: (params: any) => {
        if (params?.data?.status) {
          return (
            <div className="flex items-center  h-full">
              <Spinner size="sm" />
            </div>
          );
        }
        let destination: any = expensesRef.current?.find(
          (expense) => expense.id === params?.value
        );

        if (!destination) {
          destination = incomesRef.current?.find(
            (income) => income.id === params?.value
          );
        }
        if (!destination) {
          destination = asssetsRef.current?.find(
            (asset) => asset.id === params?.value
          );
        }
        if (!destination) {
          destination = liabilitiesRef.current?.find(
            (liability) => liability.id === params?.value
          );
        }
        return destination ? (
          <div className="flex items-center  h-full">
            <Chip radius="sm" size="sm" variant="flat" color="default">
              <div className="flex items-center gap-1">
                <AccountIconRender icon={destination?.icon} />
                <span>{destination?.name}</span>
              </div>
            </Chip>
          </div>
        ) : (
          ""
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
      editable: (params) => {
        return params.data?.type !== "loading";
      },
      cellRenderer: (params: any) => {
        const tagstring = params?.value
          ?.map((tag: { tag: { name: string; id: string } }) => {
            if (tag.tag) {
              return `#${tag.tag.name}`;
            }

            const name = tagsRef.current?.find(
              (t) => t.id === (tag as unknown as string)
            )?.name;
            return name ? `#${name}` : "";
          })
          .join(" ");

        return <div className="flex items-center  h-full">{tagstring}</div>;
      },
      cellEditor: ({ value, onValueChange, api }) => {
        const ids = value?.map((v: { tag: { id: string } }) => {
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
      editable: (params) => {
        return params.data?.type !== "loading";
      },
    },
  ]);
  useEffect(() => {
    setColDefs((prevColDefs) => {
      const updatedColDefs = [...prevColDefs];
      updatedColDefs[2] = {
        field: "content",
        width: 400,
        editable: true,
        headerName: "交易内容",
        ...(isContentWrap ? contentWrap : {}),
      };
      return updatedColDefs;
    });
  }, [isContentWrap]);

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
          if (importTable) {
            onRowEdit?.(e.data, e.rowIndex!);
            return;
          }
          const editBody = {
            [e.colDef.field as string]: e.newValue,
          };
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
          }).then(() => {
            queryClient.invalidateQueries({ refetchActive: true });
          });
        }}
        onSelectionChanged={(e) => {
          const nodes = e.api.getSelectedNodes();
          const rows = nodes.map((node) => node.data);
          onSelectionChanged(rows);
        }}
        suppressScrollOnNewData
        columnDefs={colDefs}
        getRowId={(params) => params.data.id}
        domLayout="autoHeight"
        suppressAnimationFrame
        rowSelection="multiple"
        overlayNoRowsTemplate="暂无数据"
        suppressRowClickSelection={true}
      />
    </div>
  );
};

export default TableContent;
