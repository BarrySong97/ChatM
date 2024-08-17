import { useMutation, useQuery, useQueryClient } from "react-query";
import { Tag } from "@db/schema";
import { TagService } from "../services/TagService";
import { useState } from "react";
import { message } from "antd";

export type EditTag = {
  name: string;
};

export function useTagService() {
  const queryClient = useQueryClient();
  const queryKey = ["tags"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch tag list
  const { data: tags, isLoading: isLoadingTags } = useQuery<Array<Tag>, Error>(
    queryKey,
    () => TagService.listTag()
  );

  // Create tag
  const { mutateAsync: createTag } = useMutation(
    (params: { tag: EditTag }) => TagService.createTag(params.tag),
    {
      onMutate: async (params: { tag: EditTag }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousTags = queryClient.getQueryData<Array<Tag>>(queryKey);
        queryClient.setQueryData<Array<Tag>>(
          queryKey,
          (oldTags = []) => oldTags
        );
        return { previousTags };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Tag>>(queryKey, (oldTags = []) => [
          ...oldTags,
          data,
        ]);
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousTags) {
          queryClient.setQueryData(queryKey, context.previousTags);
        }
      },
    }
  );

  // Edit tag
  const { mutateAsync: editTag } = useMutation(
    (params: { tagId: string; tag: EditTag }) =>
      TagService.editTag(params.tagId, params.tag),
    {
      onMutate: async ({ tagId, tag }) => {
        await queryClient.cancelQueries(queryKey);
        const previousTags = queryClient.getQueryData<Array<Tag>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Tag>>(queryKey, (oldTags = []) =>
          oldTags.map((t) => (t.id === tagId ? { ...t, ...tag } : t))
        );
        return { previousTags };
      },
      onSuccess() {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousTags) {
          queryClient.setQueryData(queryKey, context.previousTags);
        }
      },
    }
  );

  // Delete tag
  const { mutateAsync: deleteTag } = useMutation(
    (tagId: string) => TagService.deleteTag(tagId),
    {
      onMutate: async (tagId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousTags = queryClient.getQueryData<Array<Tag>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Tag>>(queryKey, (oldTags = []) =>
          oldTags.filter((t) => t.id !== tagId)
        );
        return { previousTags };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, _tagId, context) => {
        if (context?.previousTags) {
          queryClient.setQueryData(queryKey, context.previousTags);
        }
      },
    }
  );

  return {
    tags,
    isLoadingTags,
    editTag,
    deleteTag,
    createTag,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}
