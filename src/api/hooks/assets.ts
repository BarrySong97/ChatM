import { useMutation, useQuery, useQueryClient } from "react-query";
import { Asset } from "@db/schema";
import { AssetsService } from "../services/AssetsSevice";
import { useState } from "react";
import { message } from "antd";
import { Filter } from "./expense";
import { CategoryListData, NormalChartData, SankeyData } from "../models/Chart";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";
export type EditAsset = {
  name: string;
  initial_balance: number;
  icon?: string;
  book_id?: string;
};
export function useAssetsService(assetId?: string) {
  const queryClient = useQueryClient();

  const book = useAtomValue(BookAtom);
  const queryKey = ["assets", book?.id];

  const [isEditLoading, setisEditLoading] = useState(false);
  const [isDeleteLoading, setisDeleteLoading] = useState(false);
  const [isCreateLoading, setisCreateLoading] = useState(false);

  // get by id
  const { data: asset, isLoading: isLoadingAsset } = useQuery<
    Asset | undefined,
    Error
  >({
    queryKey: ["assets", assetId],
    enabled: !!assetId && !!book,
    keepPreviousData: true,
    queryFn: () => AssetsService.getAssetById(assetId!),
  });

  // Fetch user list
  const { data: assets, isLoading: isLoadingAssets } = useQuery<
    Array<Asset>,
    Error
  >(queryKey, () => AssetsService.listAssets(book?.id), {
    enabled: !!book,
  });

  // create asset
  const { mutateAsync: createAsset } = useMutation(
    (params: { asset: EditAsset }) =>
      AssetsService.createAsset({
        ...params.asset,
        book_id: book?.id,
      }),
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
  const book = useAtomValue(BookAtom);
  const queryKey = ["assets", "category", filter, book?.id];

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery<
    CategoryListData[],
    Error
  >(queryKey, () => AssetsService.getCategory(book?.id ?? "", filter), {
    keepPreviousData: true,

    enabled: !!book,
  });

  return {
    categoryData,
    isLoadingCategory,
  };
}
export function useAssetTrendService(filter: Filter) {
  const book = useAtomValue(BookAtom);
  const queryKey = ["assets", "trend", filter, book?.id];
  const { data: trendData, isLoading: isLoadingTrend } = useQuery<
    NormalChartData[],
    Error
  >(queryKey, () => AssetsService.getTrend(book?.id ?? "", filter), {
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    lineData: trendData,
    isLoadingTrend,
  };
}
export function useAssetSankeyService(
  accountId: string,
  type: string,
  start?: number,
  end?: number
) {
  const queryKey = ["sankey", accountId, start, end];

  const { data: sankeyData, isLoading: isLoadingSankey } = useQuery<
    SankeyData,
    Error
  >(queryKey, () => AssetsService.getSankeyData(accountId, type, start, end), {
    enabled: !!accountId,
    keepPreviousData: true,
  });

  return {
    sankeyData,
    isLoadingSankey,
  };
}
