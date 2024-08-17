import { useMutation, useQuery, useQueryClient } from "react-query";
import { Transaction } from "@db/schema";
import { TransactionService } from "../services/TransactionService";
import { useState } from "react";
import { message } from "antd";

export type EditTransaction = {
  content: string;
  transaction_date: number;
  type: string;
  source?: string;
  source_account_id: string;
  remark?: string;
  tags?: string;
  destination_account_id: string;
  amount: string;
};

export function useTransactionService() {
  const queryClient = useQueryClient();
  const queryKey = ["transactions"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch transaction list
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<
    Array<Transaction>,
    Error
  >(queryKey, () => TransactionService.listTransactions());

  // Create transaction
  const { mutateAsync: createTransaction } = useMutation(
    (params: { transaction: EditTransaction }) =>
      TransactionService.createTransaction(params.transaction),
    {
      onMutate: async (params: { transaction: EditTransaction }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousTransactions =
          queryClient.getQueryData<Array<Transaction>>(queryKey);
        return { previousTransactions };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Transaction>>(
          queryKey,
          (oldTransactions: Array<Transaction> = []) => {
            return [...oldTransactions, data];
          }
        );
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
  const { mutateAsync: editTransaction } = useMutation(
    (params: {
      transactionId: string;
      transaction: Partial<EditTransaction>;
    }) =>
      TransactionService.editTransaction(
        params.transactionId,
        params.transaction
      ),
    {
      onMutate: async ({ transactionId, transaction }) => {
        setIsEditLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousTransactions =
          queryClient.getQueryData<Array<Transaction>>(queryKey);
        queryClient.setQueryData<Array<Transaction>>(
          queryKey,
          (oldTransactions: Array<Transaction> = []) => {
            return oldTransactions?.map((t) =>
              t.id === transactionId ? { ...t, ...transaction } : t
            );
          }
        );
        return { previousTransactions };
      },
      onSuccess() {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousTransactions) {
          queryClient.setQueryData(queryKey, context.previousTransactions);
        }
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
          queryClient.getQueryData<Array<Transaction>>(queryKey);
        queryClient.setQueryData<Array<Transaction>>(
          queryKey,
          (oldTransactions: Array<Transaction> = []) => {
            return oldTransactions?.filter((t) => t.id !== transactionId);
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
          queryClient.setQueryData(queryKey, context.previousTransactions);
        }
      },
    }
  );

  return {
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
