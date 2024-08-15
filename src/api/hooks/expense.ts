import { useMutation, useQuery, useQueryClient } from "react-query";
import { Expense } from "../db";
import { ExpenseService } from "../services/ExpenseService";
import { useState } from "react";
import { message } from "antd";

export type EditExpense = {
  name: string;
};

export function useExpenseService() {
  const queryClient = useQueryClient();

  const queryKey = ["expenses"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch expense list
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<
    Array<Expense>,
    Error
  >(queryKey, () => ExpenseService.listExpense());

  // Create expense
  const { mutateAsync: createExpense } = useMutation(
    (params: { expense: EditExpense }) =>
      ExpenseService.createExpense(params.expense),
    {
      onMutate: async (params: { expense: EditExpense }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousExpenses =
          queryClient.getQueryData<Array<Expense>>(queryKey);
        queryClient.setQueryData<Array<Expense>>(
          queryKey,
          (oldExpenses: Array<Expense> = []) => {
            return oldExpenses;
          }
        );
        return { previousExpenses };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Expense>>(
          queryKey,
          (oldExpenses: Array<Expense> = []) => {
            return [...oldExpenses, data];
          }
        );
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, { expense }, context) => {
        if (context?.previousExpenses) {
          queryClient.setQueryData(queryKey, context.previousExpenses);
        }
      },
    }
  );

  // Edit expense
  const { mutateAsync: editExpense } = useMutation(
    (params: { expenseId: string; expense: EditExpense }) =>
      ExpenseService.editExpense(params.expenseId, params.expense),
    {
      onMutate: async ({ expenseId, expense }) => {
        await queryClient.cancelQueries(queryKey);
        const previousExpenses =
          queryClient.getQueryData<Array<Expense>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Expense>>(
          queryKey,
          (oldExpenses: Array<Expense> = []) => {
            return oldExpenses?.map((e) =>
              e.id === expenseId ? { ...e, ...expense } : e
            );
          }
        );
        return { previousExpenses };
      },
      onSuccess(data, variables, context) {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, { expenseId }, context) => {
        if (context?.previousExpenses) {
          queryClient.setQueryData(queryKey, context.previousExpenses);
        }
      },
    }
  );

  // Delete expense
  const { mutateAsync: deleteExpense } = useMutation(
    (expenseId: string) => ExpenseService.deleteExpense(expenseId),
    {
      onMutate: async (expenseId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousExpenses =
          queryClient.getQueryData<Array<Expense>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Expense>>(
          queryKey,
          (oldExpenses: Array<Expense> = []) => {
            return oldExpenses?.filter((e) => e.id !== expenseId);
          }
        );
        return { previousExpenses };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, expenseId, context) => {
        if (context?.previousExpenses) {
          queryClient.setQueryData(queryKey, context.previousExpenses);
        }
      },
    }
  );

  return {
    expenses,
    isLoadingExpenses,
    editExpense,
    deleteExpense,
    createExpense,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}
