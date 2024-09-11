import React, { useRef, useState } from "react";
import { Button, Link, Select, SelectItem, Spinner } from "@nextui-org/react";
import { ColDef } from "ag-grid-community";
import { ConfigProvider, DatePicker, Table, TableProps, Tag } from "antd";
import { income, Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
// import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { FinancialOperation } from "@/api/db/manager";
import { AIService, AIServiceParams } from "@/api/services/AIService";
import dayjs from "dayjs";
import to from "await-to-js";
import TableContent from "@/components/Transactions/components/TableContent";
import TitleComponent from "./TitleComponent"; // Add this import
import { useProviderStore } from "@/store/provider";

const operationColors: Record<FinancialOperation, string> = {
  [FinancialOperation.Income]: "#4CAF50", // Green
  [FinancialOperation.Expenditure]: "#F44336", // Red
  [FinancialOperation.Transfer]: "#2196F3", // Blue
  [FinancialOperation.RepayLoan]: "#9C27B0", // Purple
  [FinancialOperation.Borrow]: "#FF9800", // Orange
  [FinancialOperation.LoanExpenditure]: "#795548", // Brown
  [FinancialOperation.Refund]: "#FF9800", // Orange
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
export interface TransactionsTableProps {
  data?: Array<Transaction & { status: boolean }>;
  pureData?: Array<Array<string>>;
  onDataChange?: (data: Array<Transaction & { status: boolean }>) => void;
  importSource: string;
  provider: string;
  model: string;
}
export default function ImportDataTable({
  data,
  pureData,
  importSource,
  onDataChange,
}: TransactionsTableProps) {
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [processLoading, setProcessLoading] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const batchAiProcess = async ({
    provider,
    model,
    apiKey,
    baseURL,
  }: Omit<
    AIServiceParams,
    "expense" | "income" | "liabilities" | "assets" | "data" | "importSource"
  >) => {
    if (!pureData || !data) {
      return;
    }

    const batchSize = 10;
    const totalBatches = Math.ceil(pureData.length / batchSize);
    setProcessLoading(true);
    data.forEach((v, i) => {
      v.status = true;
    });
    onDataChange?.([...data]);
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * batchSize;
      const endIndex = Math.min((i + 1) * batchSize, pureData.length);

      const [err] = await to(
        aiProcess(startIndex, endIndex, provider, model, apiKey, baseURL)
      );

      if (err) {
        // If aiProcess returns false, stop processing
        console.log(err);

        break;
      }
    }
    // Sort data to prioritize incomplete entries
    data.sort((a, b) => {
      const aIncomplete =
        !a.type || !a.source_account_id || !a.destination_account_id || !a.type;
      const bIncomplete =
        !b.type || !b.source_account_id || !b.destination_account_id || !b.type;

      if (aIncomplete && !bIncomplete) return -1;
      if (!aIncomplete && bIncomplete) return 1;
      return 0;
    });
    data.forEach((v) => {
      v.status = false;
    });

    // Update the sorted data
    onDataChange?.([...data]);
    setProcessLoading(false);
  };
  const aiProcess = async (
    startIndex: number,
    endIndex: number,
    provider: string,
    model: string,
    apiKey: string,
    baseURL: string
  ) => {
    if (
      !expenses ||
      !incomes ||
      !liabilities ||
      !assets ||
      !pureData ||
      !data
    ) {
      return;
    }

    const params: AIServiceParams = {
      expense: expenses,
      income: incomes,
      liabilities: liabilities,
      assets: assets,
      data: pureData.slice(startIndex, endIndex),
      importSource,
      provider,
      model,
      apiKey,
      baseURL,
    };

    const stream = await AIService.getAIResponse(params);
    let dataIndex = startIndex;
    let innerIndex = 0;
    let rawText = "";
    for await (const chunk of stream) {
      rawText += chunk.choices[0].delta.content;
      const regex =
        /\{[\s\S]*?"type":\s*"([^"]*)"[\s\S]*?"source_account_id":\s*"([^"]*)"[\s\S]*?"destination_account_id":\s*"([^"]*)"[\s\S]*?\}/g;
      const matches = Array.from(rawText.matchAll(regex));
      const sub = matches.length - innerIndex;

      if (sub > 0) {
        for (let i = 0; i < sub; i++) {
          const match = matches[innerIndex];
          const [fullMatch, type, sourceAccountId, destinationAccountId] =
            match;
          data[dataIndex] = {
            ...data[dataIndex],
            type,
            source_account_id: sourceAccountId,
            destination_account_id: destinationAccountId,
            status: false, // Set status to false after processing
          };

          innerIndex++;
          dataIndex++;
          setProcessedCount(dataIndex);
        }
        onDataChange?.([...data]);
      }
    }
    return true;
  };
  const [colDefs, setColDefs] = useState<
    ColDef<Transaction & { status: boolean }>[]
  >([
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
        return data?.status ? (
          <Spinner size="sm" />
        ) : (
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

        return data?.status ? (
          <Spinner size="sm" />
        ) : (
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
        return data?.status ? (
          <Spinner size="sm" />
        ) : (
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
    <div id="import-data-table">
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerSplitColor: "transparent",
            },
          },
        }}
      >
        <TitleComponent
          totalCount={data?.length ?? 0}
          processedCount={processedCount}
          processLoading={processLoading}
          onAIProcess={batchAiProcess}
        />
        <TableContent
          transactions={data ?? []}
          assets={assets ?? []}
          liabilities={liabilities ?? []}
          incomes={incomes ?? []}
          expenses={expenses ?? []}
          pageSize={10}
          onPageSizeChange={() => {}}
          totalPages={0}
          totalCount={0}
          importTable
          selectedTransactions={[]}
          onSelectionChanged={() => {}}
        />
      </ConfigProvider>
    </div>
  );
}
