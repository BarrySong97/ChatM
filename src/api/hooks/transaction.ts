import { useMutation, useQuery, useQueryClient } from "react-query";
import { Transaction } from "@db/schema";
import { TransactionService } from "../services/TransactionService";
import { useState } from "react";
import { message } from "antd";
import { Page } from "../models/Page";
import Decimal from "decimal.js";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";

export type EditTransaction = {
  content: string;
  transaction_date: number;
  type: string;
  source?: string;
  source_account_id: string;
  remark?: string;
  tags?: string[];
  destination_account_id: string;
  amount: string;
};

export type TransactionListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  accountId?: string[];
  type?: string[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: number;
  endDate?: number;
  filterConditions?: "or" | "and";
};
export function useTransactionService(
  transactionListParams?: TransactionListParams
) {
  const queryClient = useQueryClient();
  const book = useAtomValue(BookAtom);
  const queryKey = [
    "transactions",
    book?.id,
    transactionListParams?.page ?? 1,
    transactionListParams?.pageSize ?? 10,
    transactionListParams?.search ?? "",
    transactionListParams?.accountId,
    transactionListParams?.type,
    transactionListParams?.minAmount,
    transactionListParams?.maxAmount,
    transactionListParams?.startDate,
    transactionListParams?.endDate,
    transactionListParams?.filterConditions ?? "and",
  ];

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch transaction list
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<
    Page<Transaction>,
    Error
  >(
    queryKey,
    () =>
      TransactionService.listTransactions(
        book?.id ?? "",
        transactionListParams
      ),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: !!book?.id,
    }
  );

  // Create transaction
  const { mutateAsync: createTransaction } = useMutation(
    (params: { transaction: EditTransaction }) =>
      TransactionService.createTransaction(book?.id ?? "", params.transaction),
    {
      onMutate: async (params: { transaction: EditTransaction }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousTransactions =
          queryClient.getQueryData<Page<Transaction>>(queryKey);
        return { previousTransactions };
      },
      onSuccess(data) {
        message.success("创建成功");
        // queryClient.setQueryData<Page<Transaction>>(
        //   queryKey,
        //   (
        //     oldTransactions: Page<Transaction> = {
        //       list: [],
        //       totalCount: 0,
        //       currentPage: 0,
        //       pageSize: 0,
        //       totalPages: 0,
        //     }
        //   ) => {
        //     return {
        //       ...oldTransactions,
        //     };
        //   }
        // );
        queryClient.invalidateQueries(["side"]);

        queryClient.invalidateQueries(queryKey);
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, _variables, context) => {
        message.error("创建失败: " + (_error as Error).message);
        if (context?.previousTransactions) {
          queryClient.setQueryData(queryKey, context.previousTransactions);
        }
      },
    }
  );

  // Edit transaction
  const { mutateAsync: editTransaction, isLoading: isEditLoading } =
    useMutation(
      (params: {
        transactionId: string;
        transaction: Partial<EditTransaction>;
      }) =>
        TransactionService.editTransaction(
          params.transactionId,
          params.transaction
        ),
      {
        onSuccess() {
          message.success("修改成功");
          queryClient.invalidateQueries(["side"]);
          queryClient.invalidateQueries(queryKey);
        },
        onError: (_error, _variables, context) => {
          message.error("修改失败: " + (_error as Error).message);
        },
      }
    );

  // Delete transaction
  const { mutateAsync: deleteTransaction } = useMutation(
    (transactionId: string) =>
      TransactionService.deleteTransaction(transactionId),
    {
      onMutate: async (transactionId: string) => {
        setIsDeleteLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousTransactions =
          queryClient.getQueryData<Page<Transaction>>(queryKey);
        queryClient.setQueryData<Page<Transaction>>(
          queryKey,
          (
            oldTransactions: Page<Transaction> = {
              list: [],
              totalCount: 0,
              currentPage: 0,
              pageSize: 0,
              totalPages: 0,
            }
          ) => {
            return {
              ...oldTransactions,
              list: oldTransactions.list.filter((t) => t.id !== transactionId),
            };
          }
        );
        return { previousTransactions };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousTransactions) {
          message.error("删除失败: " + (_error as Error).message);
          queryClient.setQueryData(queryKey, context.previousTransactions);
        }
      },
    }
  );

  const {
    mutateAsync: deleteTransactions,
    isLoading: isDeleteTransactionsLoading,
  } = useMutation(
    (transactionIds: string[]) =>
      TransactionService.deleteTransactions(transactionIds),
    {
      onError(error) {
        message.error("删除失败: " + (error as Error).message);
      },
      onSuccess() {
        message.success("删除成功");

        queryClient.invalidateQueries(queryKey);
        queryClient.invalidateQueries(["side"]);
      },
    }
  );

  return {
    deleteTransactions,
    isDeleteTransactionsLoading,
    transactions,
    isLoadingTransactions,
    editTransaction,
    deleteTransaction,
    createTransaction,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}
