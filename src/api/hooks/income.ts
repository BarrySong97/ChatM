import { useMutation, useQuery, useQueryClient } from "react-query";
import { Income } from "@db/schema";
import { IncomeService } from "../services/IncomeService";
import { useState } from "react";
import { message } from "antd";
import { Filter } from "./expense";
import { CategoryListData, NormalChartData } from "../models/Chart";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";

export type EditIncome = {
  name: string;
  icon?: string;
  book_id?: string;
};

export function useIncomeService() {
  const queryClient = useQueryClient();
  const book = useAtomValue(BookAtom);
  const queryKey = ["incomes", book?.id];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  // Fetch income list
  const { data: incomes, isLoading: isLoadingIncomes } = useQuery<
    Array<Income>,
    Error
  >(queryKey, () => IncomeService.listIncome(book?.id), {
    keepPreviousData: true,
    enabled: !!book,
  });

  // Create income
  const { mutateAsync: createIncome } = useMutation(
    (params: { income: EditIncome }) =>
      IncomeService.createIncome({
        ...params.income,
        book_id: book?.id,
      }),
    {
      onMutate: async (params: { income: EditIncome }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousIncomes =
          queryClient.getQueryData<Array<Income>>(queryKey);
        queryClient.setQueryData<Array<Income>>(
          queryKey,
          (oldIncomes: Array<Income> = []) => {
            return oldIncomes;
          }
        );
        return { previousIncomes };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Income>>(
          queryKey,
          (oldIncomes: Array<Income> = []) => {
            return [...oldIncomes, data];
          }
        );
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, { income }, context) => {
        if (context?.previousIncomes) {
          queryClient.setQueryData(queryKey, context.previousIncomes);
        }
      },
    }
  );

  // Edit income
  const { mutateAsync: editIncome } = useMutation(
    (params: { incomeId: string; income: EditIncome }) =>
      IncomeService.editIncome(params.incomeId, params.income),
    {
      onMutate: async ({ incomeId, income }) => {
        await queryClient.cancelQueries(queryKey);
        const previousIncomes =
          queryClient.getQueryData<Array<Income>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Income>>(
          queryKey,
          (oldIncomes: Array<Income> = []) => {
            return oldIncomes?.map((i) =>
              i.id === incomeId ? { ...i, ...income } : i
            );
          }
        );
        return { previousIncomes };
      },
      onSuccess(data, variables, context) {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, { incomeId }, context) => {
        if (context?.previousIncomes) {
          queryClient.setQueryData(queryKey, context.previousIncomes);
        }
      },
    }
  );

  // Delete income
  const { mutateAsync: deleteIncome } = useMutation(
    (incomeId: string) => IncomeService.deleteIncome(incomeId),
    {
      onMutate: async (incomeId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousIncomes =
          queryClient.getQueryData<Array<Income>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Income>>(
          queryKey,
          (oldIncomes: Array<Income> = []) => {
            return oldIncomes?.filter((i) => i.id !== incomeId);
          }
        );
        return { previousIncomes };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, incomeId, context) => {
        if (context?.previousIncomes) {
          queryClient.setQueryData(queryKey, context.previousIncomes);
        }
      },
    }
  );

  return {
    incomes,
    isLoadingIncomes,
    editIncome,
    deleteIncome,
    createIncome,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}

export function useIncomeLineChartService(filter: Filter) {
  const book = useAtomValue(BookAtom);
  const queryKey = ["incomes", "chart", filter, book?.id];

  const { data: chartData, isLoading: isLoadingChart } = useQuery<
    NormalChartData[],
    Error
  >(queryKey, () => IncomeService.getTrend(book?.id ?? "", filter), {
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    lineData: chartData,
    isLoadingChart,
  };
}

export function useIncomeCategoryService(filter: Filter) {
  const book = useAtomValue(BookAtom);
  const queryKey = ["incomes", "category", filter, book?.id];

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery<
    CategoryListData[],
    Error
  >(queryKey, () => IncomeService.getIncomeCategory(book?.id ?? "", filter), {
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    categoryData,
    isLoadingCategory,
  };
}
