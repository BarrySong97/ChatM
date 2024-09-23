import { useRef, useState } from "react";
import {
  ConfigProvider,
  DatePicker,
  message,
  Table,
  TableProps,
  Tag,
} from "antd";
import { Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { FinancialOperation } from "@/api/db/manager";
import { AIService, AIServiceParams } from "@/api/services/AIService";
import to from "await-to-js";
import TableContent from "@/components/Transactions/components/TableContent";
import TitleComponent from "./TitleComponent"; // Add this import
import { Button } from "@nextui-org/react";
import PopoverConfirm from "@/components/PopoverConfirm";
import { useTagService } from "@/api/hooks/tag";
import { useAtomValue } from "jotai";
import { LicenseAtom } from "@/globals";

export interface TransactionsTableProps {
  data?: Array<
    Transaction & { status: boolean } & {
      transactionTags: Array<{
        tag: { name: string; id: string };
      }>;
    }
  >;
  pureData?: Array<Array<string>>;
  onDataChange?: (data: Array<Transaction & { status: boolean }>) => void;
  isContentWrap: boolean;
  importSource: string;
  provider: string;
  model: string;
}
export default function ImportDataTable({
  data,
  pureData,
  importSource,
  onDataChange,
  isContentWrap,
}: TransactionsTableProps) {
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [processLoading, setProcessLoading] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAbort = useRef<boolean>(false);
  const { tags } = useTagService();
  const latestData = useRef<Array<Transaction & { status: boolean }>>([]);
  latestData.current = data ?? [];
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
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      if (isAbort.current) {
        break;
      }
      const [err] = await to(
        aiProcess(
          startIndex,
          endIndex,
          provider,
          model,
          apiKey,
          baseURL,
          abortController
        )
      );

      if (err) {
        // If aiProcess returns false, stop processing
        message.error(`AI处理失败，${err.message}`);
        data.forEach((v) => {
          v.status = false;
        });

        break;
      }
    }
    // Sort data to prioritize incomplete entries
    if (!isAbort.current) {
      console.log(latestData.current);
      latestData.current.sort((a, b) => {
        const isValidAccount = (id: string) => {
          return (
            expenses?.some((e) => e.id === id) ||
            incomes?.some((i) => i.id === id) ||
            liabilities?.some((l) => l.id === id) ||
            assets?.some((a) => a.id === id)
          );
        };

        const aIncomplete =
          !a.source_account_id ||
          !a.destination_account_id ||
          !a.type ||
          !isValidAccount(a.source_account_id) ||
          !isValidAccount(a.destination_account_id);
        const bIncomplete =
          !b.source_account_id ||
          !b.destination_account_id ||
          !b.type ||
          !isValidAccount(b.source_account_id) ||
          !isValidAccount(b.destination_account_id);

        if (aIncomplete) {
          a.source_account_id = isValidAccount(a.source_account_id ?? "")
            ? a.source_account_id
            : "";
          a.destination_account_id = isValidAccount(
            a.destination_account_id ?? ""
          )
            ? a.destination_account_id
            : "";
        }
        if (bIncomplete) {
          b.source_account_id = isValidAccount(b.source_account_id ?? "")
            ? b.source_account_id
            : "";
          b.destination_account_id = isValidAccount(
            b.destination_account_id ?? ""
          )
            ? b.destination_account_id
            : "";
        }

        if (aIncomplete && !bIncomplete) return -1;
        if (!aIncomplete && bIncomplete) return 1;
        if (aIncomplete && bIncomplete) {
          // If both are incomplete, maintain their original order
          return 0;
        }
        // If both are complete, maintain their original order
        return 0;
      });
    }
    isAbort.current = false;
    latestData.current.forEach((v) => {
      v.status = false;
    });

    // Update the sorted data
    onDataChange?.([...latestData.current]);
    setProcessLoading(false);
  };
  const aiProcess = async (
    startIndex: number,
    endIndex: number,
    provider: string,
    model: string,
    apiKey: string,
    baseURL: string,
    abortController: AbortController
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
      data: data.slice(startIndex, endIndex),
      importSource,
      provider,
      model,
      apiKey,
      baseURL,
      tags: tags ?? [],
    };

    const stream = await AIService.getAIResponse(params, abortController);
    let dataIndex = startIndex;
    let innerIndex = 0;
    let rawText = "";
    for await (const chunk of stream) {
      rawText += chunk.choices[0].delta.content;
      const regex =
        /\{[\s\S]*?"type":\s*"([^"]*)"[\s\S]*?"source_account_id":\s*"([^"]*)"[\s\S]*?"destination_account_id":\s*"([^"]*)"[\s\S]*?"transactionTags":\s*(\[[\s\S]*?\])[\s\S]*?\}/g;

      const matches = Array.from(rawText.matchAll(regex));
      const sub = matches.length - innerIndex;
      if (sub > 0) {
        for (let i = 0; i < sub; i++) {
          const match = matches[innerIndex];
          const [
            fullMatch,
            type,
            sourceAccountId,
            destinationAccountId,
            transactionTags,
          ] = match;
          data[dataIndex] = {
            ...data[dataIndex],
            type,
            source_account_id: sourceAccountId,
            transactionTags: transactionTags
              ? (JSON.parse(transactionTags) as Array<string>).map((v) => ({
                  tag: {
                    name: tags?.find((tag) => tag.id === v)?.name ?? "",
                    id: v,
                  },
                }))
              : [],
            destination_account_id: destinationAccountId,
            status: false, // Set status to false after processing
          };

          innerIndex++;
          dataIndex++;
          setProcessedCount(dataIndex);
        }
        const res = [...data];
        onDataChange?.(res);
      }
    }

    return true;
  };

  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const deleteTransactions = (ids: string[]) => {
    const newData = data?.filter((v) => !ids.includes(v.id));
    onDataChange?.(newData ?? []);
  };
  return (
    <div id="import-data-table relative">
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
          abortControllerRef={abortControllerRef}
          isAbort={isAbort}
          totalCount={data?.length ?? 0}
          processedCount={processedCount}
          processLoading={processLoading}
          onAIProcess={batchAiProcess}
        />
        <TableContent
          transactions={data ?? []}
          onRowEdit={(row, rowIndex) => {
            latestData.current[rowIndex] = {
              ...row,
              transactionTags: row.transactionTags.map((tag: string) => ({
                tag: {
                  name: tags?.find((t) => t.id === tag)?.name ?? "",
                  id: tag,
                },
              })),
            };
            onDataChange?.([...latestData.current]);
          }}
          assets={assets ?? []}
          liabilities={liabilities ?? []}
          incomes={incomes ?? []}
          expenses={expenses ?? []}
          pageSize={10}
          isContentWrap={isContentWrap}
          onPageSizeChange={() => {}}
          totalPages={0}
          totalCount={0}
          importTable
          selectedTransactions={selectedRows}
          onSelectionChanged={setSelectedRows}
        />
        <div
          className="absolute bottom-[70px] left-0 right-0 bg-background border-t border-b-none  rounded-b-none border-divider shadow-none transition-transform duration-300 ease-in-out transform translate-y-0"
          style={{
            transform:
              selectedRows.length > 0
                ? "translateY(0)"
                : "translateY(calc(100% - 20px))",
            opacity: selectedRows.length > 0 ? 1 : 0,
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          }}
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="text-sm">
              已选择 <span className="font-bold">{selectedRows.length}</span> 项
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => setSelectedRows([])}
                variant="flat"
                size="sm"
                radius="sm"
              >
                取消选择
              </Button>
              <PopoverConfirm
                title="删除所选多个流水"
                desc="删除所选多个流水将无法恢复，请谨慎操作"
                onOk={async () => {
                  await deleteTransactions(selectedRows.map((row) => row.id));
                  return Promise.resolve();
                }}
              >
                <Button radius="sm" size="sm" color="danger">
                  删除所选
                </Button>
              </PopoverConfirm>
            </div>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}
