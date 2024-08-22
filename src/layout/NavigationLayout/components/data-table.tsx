import React, { useState } from "react";
import { Button, Link, Spinner } from "@nextui-org/react";
import { ConfigProvider, Table, TableProps, Tag } from "antd";
import { income, Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import Decimal from "decimal.js";
import { FinancialOperation } from "@/api/db/manager";
import { AIService } from "@/api/services/AIService";

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
  data?: Array<Transaction & { status: boolean }>;
  pureData?: Array<Array<string>>;
  onDataChange?: (data: Array<Transaction & { status: boolean }>) => void;
}
export default function ImportDataTable({
  data,
  pureData,
  onDataChange,
}: TransactionsTableProps) {
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();

  const columns: TableProps<Transaction & { status: boolean }>["columns"] = [
    {
      title: "",
      dataIndex: "status",
      key: "status",
      width: 100,
      render(value, record, index) {
        return (
          <Button isLoading={record.status} variant="flat" size="sm">
            AI匹配
          </Button>
        );
      },
    },
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
      title: "内容",
      dataIndex: "content",
      key: "content",
      render(value, record, index) {
        return (
          <div title={value} className="max-w-[300px] truncate">
            {value}
          </div>
        );
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      align: "right",
      width: 100,
      key: "amount",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
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
  const aiProcess = async () => {
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
    onDataChange?.(data.map((item) => ({ ...item, status: true })));
    const stream = await AIService.getAIResponse(
      expenses,
      incomes,
      liabilities,
      assets,
      pureData.slice(0, 10)
    );
    let dataIndex = 0;
    let rawText = "";
    for await (const chunk of stream) {
      rawText += chunk.choices[0].delta.content;
      const regex =
        /\{[\s\S]*?"type":\s*"([^"]*)"[\s\S]*?"source_account_id":\s*"([^"]*)"[\s\S]*?"destination_account_id":\s*"([^"]*)"[\s\S]*?\}/g;
      const matches = rawText.matchAll(regex);

      for (const match of matches) {
        const [fullMatch, type, sourceAccountId, destinationAccountId] = match;

        if (data && dataIndex < data.length && !data[dataIndex].status) {
          console.log(222);

          data[dataIndex] = {
            ...data[dataIndex],
            type,
            source_account_id: sourceAccountId,
            destination_account_id: destinationAccountId,
            status: false, // Set status to false after processing
          };
          dataIndex++;
          onDataChange?.([...data]);
        }
      }
      dataIndex = 0;
    }
  };

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <div>共{data?.length}条数据</div>
        <div>
          <Button onClick={aiProcess} radius="sm" size="sm" color="primary">
            一键AI处理
          </Button>
        </div>
        {/* <div>AI已处理</div> */}
      </div>
    );
  };
  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              // headerBg: "transparent",
              headerSplitColor: "transparent",
            },
          },
        }}
      >
        <Table
          pagination={false}
          columns={columns}
          title={renderTitle}
          scroll={{
            x: 1000,
            y: 400,
          }}
          rowKey={"id"}
          dataSource={data}
        ></Table>
      </ConfigProvider>
    </div>
  );
}
