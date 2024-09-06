import { useMutation, useQuery, useQueryClient } from "react-query";
import { Liability } from "@db/schema";
import { LiabilityService } from "../services/LiabilityService";
import { useState } from "react";
import { message } from "antd";
import { Filter } from "./expense";
import { CategoryListData, NormalChartData } from "../models/Chart";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";

export type EditLiability = {
  name: string;
  icon?: string;
};

export function useLiabilityService() {
  const queryClient = useQueryClient();

  const book = useAtomValue(BookAtom);
  const queryKey = ["liabilities", book?.id];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  // Fetch liability list
  const { data: liabilities, isLoading: isLoadingLiabilities } = useQuery<
    Array<Liability>,
    Error
  >(queryKey, () => LiabilityService.listLiability(book?.id), {
    keepPreviousData: true,
    enabled: !!book,
  });

  // Create liability
  const { mutateAsync: createLiability } = useMutation(
    (params: { liability: EditLiability }) =>
      LiabilityService.createLiability(book?.id ?? "", params.liability),
    {
      onMutate: async (params: { liability: EditLiability }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousLiabilities =
          queryClient.getQueryData<Array<Liability>>(queryKey);
        queryClient.setQueryData<Array<Liability>>(
          queryKey,
          (oldLiabilities: Array<Liability> = []) => {
            return [...oldLiabilities];
          }
        );
        return { previousLiabilities };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Liability>>(
          queryKey,
          (oldLiabilities: Array<Liability> = []) => {
            return [...oldLiabilities, data];
          }
        );
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, { liability }, context) => {
        if (context?.previousLiabilities) {
          queryClient.setQueryData(queryKey, context.previousLiabilities);
        }
      },
    }
  );

  // Edit liability
  const { mutateAsync: editLiability } = useMutation(
    (params: { liabilityId: string; liability: EditLiability }) =>
      LiabilityService.editLiability(params.liabilityId, params.liability),
    {
      onMutate: async ({ liabilityId, liability }) => {
        await queryClient.cancelQueries(queryKey);
        const previousLiabilities =
          queryClient.getQueryData<Array<Liability>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Liability>>(
          queryKey,
          (oldLiabilities: Array<Liability> = []) => {
            return oldLiabilities?.map((l) =>
              l.id === liabilityId ? { ...l, ...liability } : l
            );
          }
        );
        return { previousLiabilities };
      },
      onSuccess(data, variables, context) {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, { liabilityId }, context) => {
        if (context?.previousLiabilities) {
          queryClient.setQueryData(queryKey, context.previousLiabilities);
        }
      },
    }
  );

  // Delete liability
  const { mutateAsync: deleteLiability } = useMutation(
    (liabilityId: string) => LiabilityService.deleteLiability(liabilityId),
    {
      onMutate: async (liabilityId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousLiabilities =
          queryClient.getQueryData<Array<Liability>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Liability>>(
          queryKey,
          (oldLiabilities: Array<Liability> = []) => {
            return oldLiabilities?.filter((l) => l.id !== liabilityId);
          }
        );
        return { previousLiabilities };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, liabilityId, context) => {
        if (context?.previousLiabilities) {
          queryClient.setQueryData(queryKey, context.previousLiabilities);
        }
      },
    }
  );

  return {
    liabilities,
    isLoadingLiabilities,
    editLiability,
    deleteLiability,
    createLiability,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}

export function useLiabilityCategoryService(filter: Filter) {
  const book = useAtomValue(BookAtom);
  const queryKey = ["liabilities", "category", filter, book?.id];

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery<
    CategoryListData[],
    Error
  >(queryKey, () => LiabilityService.getCategory(book?.id ?? "", filter), {
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    categoryData,
    isLoadingCategory,
  };
}
export function useLiabilityTrendService(filter: Filter) {
  const book = useAtomValue(BookAtom);
  const queryKey = ["liabilities", "trend", filter, book?.id];

  const { data: trendData, isLoading: isLoadingTrend } = useQuery<
    NormalChartData[],
    Error
  >(queryKey, () => LiabilityService.getTrend(book?.id ?? "", filter), {
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    lineData: trendData,
    isLoadingTrend,
  };
}
