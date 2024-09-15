import { useMutation, useQuery, useQueryClient } from "react-query";
import { Provider } from "@db/schema";
import { ProviderService, EditProvider } from "../services/ProviderService";
import { useState } from "react";
import { message } from "antd";

export function useProviderService() {
  const queryClient = useQueryClient();
  const queryKey = ["providers"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch provider list
  const { data: providers, isLoading: isLoadingProviders } = useQuery<
    Array<Provider>,
    Error
  >(queryKey, () => ProviderService.listProviders(), {
    keepPreviousData: true,
  });

  // Create provider
  const { mutateAsync: createProvider } = useMutation(
    (params: { provider: EditProvider }) =>
      ProviderService.createProvider(params.provider),
    {
      onMutate: async (params: { provider: EditProvider }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousProviders =
          queryClient.getQueryData<Array<Provider>>(queryKey);
        queryClient.setQueryData<Array<Provider>>(
          queryKey,
          (oldProviders = []) => oldProviders
        );
        return { previousProviders };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Provider>>(
          queryKey,
          (oldProviders = []) => [...oldProviders, data]
        );
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousProviders) {
          queryClient.setQueryData(queryKey, context.previousProviders);
        }
      },
    }
  );

  // Edit provider
  const { mutateAsync: editProvider } = useMutation(
    (params: { providerId: string; provider: EditProvider }) =>
      ProviderService.editProvider(params.providerId, params.provider),
    {
      onSuccess() {
        queryClient.invalidateQueries(queryKey);
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, _variables, context) => {
        message.error("编辑失败");
      },
    }
  );

  // Delete provider
  const { mutateAsync: deleteProvider } = useMutation(
    (providerId: string) => ProviderService.deleteProvider(providerId),
    {
      onMutate: async (providerId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousProviders =
          queryClient.getQueryData<Array<Provider>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Provider>>(
          queryKey,
          (oldProviders = []) => oldProviders.filter((p) => p.id !== providerId)
        );
        return { previousProviders };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, _providerId, context) => {
        if (context?.previousProviders) {
          queryClient.setQueryData(queryKey, context.previousProviders);
        }
      },
    }
  );

  return {
    providers,
    isLoadingProviders,
    editProvider,
    deleteProvider,
    createProvider,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}
