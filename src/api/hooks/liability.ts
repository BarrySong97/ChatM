import { useMutation, useQuery, useQueryClient } from "react-query";
import { Liability } from "@db/schema";
import { LiabilityService } from "../services/LiabilityService";
import { useState } from "react";
import { message } from "antd";
import { Filter } from "./expense";
import { CategoryListData, NormalChartData } from "../models/Chart";

export type EditLiability = {
  name: string;
  icon?: string;
};

export function useLiabilityService() {
  const queryClient = useQueryClient();

  const queryKey = ["liabilities"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch liability list
  const { data: liabilities, isLoading: isLoadingLiabilities } = useQuery<
    Array<Liability>,
    Error
  >(queryKey, () => LiabilityService.listLiability(), {
    keepPreviousData: true,
  });

  // Create liability
  const { mutateAsync: createLiability } = useMutation(
    (params: { liability: EditLiability }) =>
      LiabilityService.createLiability(params.liability),
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
  const queryKey = ["liabilities", "category", filter];

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery<
    CategoryListData[],
    Error
  >(queryKey, () => LiabilityService.getCategory(filter), {
    keepPreviousData: true,
  });

  return {
    categoryData,
    isLoadingCategory,
  };
}
export function useLiabilityTrendService(filter: Filter) {
  const queryKey = ["liabilities", "trend", filter];

  const { data: trendData, isLoading: isLoadingTrend } = useQuery<
    NormalChartData[],
    Error
  >(queryKey, () => LiabilityService.getTrend(filter), {
    keepPreviousData: true,
  });

  return {
    lineData: trendData,
    isLoadingTrend,
  };
}
