import { useMutation, useQuery, useQueryClient } from "react-query";
import { Asset } from "@db/schema";
import { AssetsService } from "../services/AssetsSevice";
import { useState } from "react";
import { message } from "antd";
import { Filter } from "./expense";
export type EditAsset = {
  name: string;
  initial_balance: string;
};
export function useAssetsService(assetId?: string) {
  const queryClient = useQueryClient();

  const queryKey = ["assets"];

  const [isEditLoading, setisEditLoading] = useState(false);
  const [isDeleteLoading, setisDeleteLoading] = useState(false);
  const [isCreateLoading, setisCreateLoading] = useState(false);

  // get by id
  const { data: asset, isLoading: isLoadingAsset } = useQuery<
    Asset | undefined,
    Error
  >({
    queryKey: ["assets", assetId],
    enabled: !!assetId,
    queryFn: () => AssetsService.getAssetById(assetId!),
  });

  // Fetch user list
  const { data: assets, isLoading: isLoadingAssets } = useQuery<
    Array<Asset>,
    Error
  >(queryKey, () => AssetsService.listAssets());

  // create asset
  const { mutateAsync: createAsset } = useMutation(
    (params: { asset: EditAsset }) => AssetsService.createAsset(params.asset),
    {
      onMutate: async (params: { asset: EditAsset }) => {
        setisCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousAssets = queryClient.getQueryData<Array<Asset>>(queryKey);
        queryClient.setQueryData<Array<Asset>>(
          queryKey,
          (oldAssets: Array<Asset> = []) => {
            return oldAssets;
          }
        );
        return { previousAssets };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Asset>>(
          queryKey,
          (oldAssets: Array<Asset> = []) => {
            return [...oldAssets, data];
          }
        );
      },
      onSettled() {
        setisCreateLoading(false);
      },
      onError: (_error, { asset }, context) => {
        message.error("创建失败: " + (_error as Error).message);
        if (context?.previousAssets) {
          queryClient.setQueryData(queryKey, context.previousAssets);
        }
      },
    }
  );
  // Edit asset
  const { mutateAsync: editAsset } = useMutation(
    (params: { assetId: string; asset: EditAsset }) =>
      AssetsService.editAsset(params.assetId, params.asset),
    {
      onMutate: async ({ assetId, asset }) => {
        await queryClient.cancelQueries(queryKey);
        const previousAssets = queryClient.getQueryData<Array<Asset>>(queryKey);
        setisEditLoading(true);
        queryClient.setQueryData<Array<Asset>>(
          queryKey,
          (oldAssets: Array<Asset> = []) => {
            return oldAssets?.map((u) =>
              u.id === assetId ? { ...u, ...asset } : u
            );
          }
        );
        return { previousAssets };
      },
      onSuccess(data, variables, context) {
        message.success("修改成功");
      },
      onSettled() {
        setisEditLoading(false);
      },
      onError: (_error, { assetId }, context) => {
        if (context?.previousAssets) {
          queryClient.setQueryData(queryKey, context.previousAssets);
        }
      },
    }
  );

  // delete asset
  const { mutateAsync: deleteAsset } = useMutation(
    (assetId: string) => AssetsService.deleteAsset(assetId),
    {
      onMutate: async (assetId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousAssets = queryClient.getQueryData<Array<Asset>>(queryKey);
        setisDeleteLoading(true);
        queryClient.setQueryData<Array<Asset>>(
          queryKey,
          (oldAssets: Array<Asset> = []) => {
            return oldAssets?.filter((u) => u.id !== assetId);
          }
        );
        return { previousAssets };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setisDeleteLoading(false);
      },
      onError: (_error, assetId, context) => {
        if (context?.previousAssets) {
          queryClient.setQueryData(queryKey, context.previousAssets);
        }
      },
    }
  );
  return {
    assets,
    asset,
    isLoadingAssets,
    editAsset,
    deleteAsset,
    createAsset,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}

export function useAssetCategoryService(filter: Filter) {
  const queryKey = ["assets", "category", filter];

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery<
    CategoryListData[],
    Error
  >(queryKey, () => AssetsService.getCategory(filter));

  return {
    categoryData,
    isLoadingCategory,
  };
}
export function useAssetTrendService(filter: Filter) {
  const queryKey = ["assets", "trend", filter];
  const { data: trendData, isLoading: isLoadingTrend } = useQuery<
    NoramlChartData[],
    Error
  >(queryKey, () => AssetsService.getTrend(filter));

  return {
    lineData: trendData,
    isLoadingTrend,
  };
}
