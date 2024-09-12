import { useMutation, useQuery, useQueryClient } from "react-query";
import { Model } from "@db/schema";
import { ModelService, EditModel } from "../services/ModelService";
import { useState } from "react";
import { message } from "antd";

export const useModelService = (providerId: string) => {
  const [models, setModels] = useState<Model[]>([]);

  const queryClient = useQueryClient();
  const queryKey = ["models", providerId];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch model list
  const { data: modelsData, isLoading: isLoadingModels } = useQuery<
    Array<Model>,
    Error
  >(queryKey, () => ModelService.listModels(providerId), {
    keepPreviousData: true,
    enabled: !!providerId,
  });

  // Create model
  const { mutateAsync: createModel } = useMutation(
    (params: { model: EditModel }) => ModelService.createModel(params.model),
    {
      onMutate: async (params: { model: EditModel }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousModels = queryClient.getQueryData<Array<Model>>(queryKey);
        queryClient.setQueryData<Array<Model>>(
          queryKey,
          (oldModels = []) => oldModels
        );
        return { previousModels };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Model>>(queryKey, (oldModels = []) => [
          ...oldModels,
          data,
        ]);
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousModels) {
          queryClient.setQueryData(queryKey, context.previousModels);
        }
      },
    }
  );

  // Edit model
  const { mutateAsync: editModel } = useMutation(
    (params: { modelId: string; model: EditModel }) =>
      ModelService.editModel(params.modelId, params.model),
    {
      onMutate: async ({ modelId, model }) => {
        await queryClient.cancelQueries(queryKey);
        const previousModels = queryClient.getQueryData<Array<Model>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Model>>(queryKey, (oldModels = []) =>
          oldModels.map((m) => (m.id === modelId ? { ...m, ...model } : m))
        );
        return { previousModels };
      },
      onSuccess() {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousModels) {
          queryClient.setQueryData(queryKey, context.previousModels);
        }
      },
    }
  );

  // Delete model
  const { mutateAsync: deleteModel } = useMutation(
    (modelId: string) => ModelService.deleteModel(modelId),
    {
      onMutate: async (modelId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousModels = queryClient.getQueryData<Array<Model>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Model>>(queryKey, (oldModels = []) =>
          oldModels.filter((m) => m.id !== modelId)
        );
        return { previousModels };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, _modelId, context) => {
        if (context?.previousModels) {
          queryClient.setQueryData(queryKey, context.previousModels);
        }
      },
    }
  );

  return { models: modelsData, createModel };
};
