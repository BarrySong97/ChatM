import { useRef, useState } from "react";
import { ConfigProvider } from "antd";
import { Transaction } from "@db/schema";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { AIService, AIServiceParams } from "@/api/services/AIService";
import TableContent from "@/components/Transactions/components/TableContent";
import TitleComponent from "./TitleComponent"; // Add this import
import { Button } from "@nextui-org/react";
import PopoverConfirm from "@/components/PopoverConfirm";
import { useTagService } from "@/api/hooks/tag";

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
  const abortControllerRef = useRef<AbortController[]>([]);
  const isAbort = useRef<boolean>(false);
  const { tags } = useTagService();
  const latestData = useRef<Array<Transaction & { status: boolean }>>([]);
  const [isInverseSelection, setIsInverseSelection] = useState(false);
  latestData.current = data ?? [];
  const batchAiProcess = async ({
    provider,
    model,
    apiKey,
    baseURL,
    concurrency,
  }: Omit<
    AIServiceParams,
    "expense" | "income" | "liabilities" | "assets" | "data" | "importSource"
  >) => {
    if (!pureData || !data) {
      return;
    }

    const batchSize = concurrency ?? 30;

    const processBatch = async (startIndex: number, endIndex: number) => {
      const promises = [];
      for (let i = startIndex; i < endIndex; i += 1) {
        if (i >= latestData.current.length || isAbort.current) {
          break;
        }
        const abortController = new AbortController();
        abortControllerRef.current[i] = abortController;
        promises.push(
          aiProcess(i, provider, model, apiKey, baseURL, abortController)
        );
      }
      await Promise.all(promises);
    };

    try {
      setProcessLoading(true);
      const newData = latestData.current.map((v) => {
        return {
          ...v,
          status: true,
          destination_account_id: "loading",
          pre_destination_account_id: v.destination_account_id,
          source_account_id: "loading",
          pre_source_account_id: v.source_account_id,
          type: "loading",
          pre_type: v.type,
          transactionTags: [],
        };
      });
      onDataChange?.(newData);
      for (let i = 0; i < latestData.current.length; i += batchSize) {
        if (isAbort.current) {
          break;
        }
        const endIndex = Math.min(i + batchSize, latestData.current.length);
        await processBatch(i, endIndex);
      }
    } catch (error) {
      console.log(error);
    }

    if (!isAbort.current) {
      // Existing sorting logic
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
    } else {
      const newData = latestData.current.map((v) => {
        const { pre_destination_account_id, pre_source_account_id, pre_type } =
          v as any;
        return {
          ...v,
          status: false,
          destination_account_id:
            v.destination_account_id === "loading"
              ? pre_destination_account_id
              : "aborted",
          source_account_id:
            v.source_account_id === "loading"
              ? pre_source_account_id
              : "aborted",
          type: v.type === "loading" ? pre_type : "aborted",
        };
      });
      latestData.current = newData;
    }

    isAbort.current = false;

    // Update the sorted data
    onDataChange?.([...latestData.current]);
    setProcessLoading(false);
  };
  const aiProcess = async (
    index: number,
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
      data: data[index],
      importSource,
      provider,
      model,
      apiKey,
      baseURL,
      tags: tags ?? [],
    };

    const stream = await AIService.getAIResponse(params, abortController);
    let rawText = "";
    for await (const chunk of stream) {
      rawText += chunk.choices[0].delta.content;
      const regex =
        /\{[\s\S]*?"type":\s*"([^"]*)"[\s\S]*?"source_account_id":\s*"([^"]*)"[\s\S]*?"destination_account_id":\s*"([^"]*)"[\s\S]*?"transactionTags":\s*(\[[\s\S]*?\])[\s\S]*?\}/g;

      const matches = Array.from(rawText.matchAll(regex));
      const match = matches?.[0];
      if (!match) {
        continue;
      }

      const [_, type, sourceAccountId, destinationAccountId, transactionTags] =
        match;

      data[index] = {
        ...data[index],
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

      setProcessedCount(index);
      onDataChange?.([...data]);
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
              transactionTags: row.transactionTags?.map((tag: string) => {
                const tagId =
                  typeof tag === "string"
                    ? tag
                    : (tag as { tag: { id: string } }).tag.id;
                return {
                  tag: {
                    name: tags?.find((t) => t.id === tagId)?.name ?? "",
                    id: tagId,
                  },
                };
              }),
            };
            // onDataChange?.([...latestData.current]);
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
          isInverseSelection={isInverseSelection}
          selectedTransactions={selectedRows}
          onSelectionChanged={setSelectedRows}
          onInverseSelectionChanged={() => {
            setIsInverseSelection(false);
          }}
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
                onClick={() => {
                  const newSelectedRows = data?.filter(
                    (v) => !selectedRows.find((s) => s.id === v.id)
                  );
                  setSelectedRows(newSelectedRows ?? []);
                  setIsInverseSelection(true);
                }}
                variant="flat"
                size="sm"
                radius="sm"
              >
                反选
              </Button>
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
