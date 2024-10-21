import { useMutation, useQuery, useQueryClient } from "react-query";
import { User } from "@db/schema";
import { UserService, UserCreate } from "../services/user";
import { useState } from "react";
import { message } from "antd";

export function useUserService() {
  const queryClient = useQueryClient();
  const queryKey = ["user"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);

  // Fetch default user
  const { data: user, isLoading: isLoadingUser } = useQuery<
    User | undefined,
    Error
  >({
    queryKey: queryKey,
    queryFn: () => UserService.findDefault(),
  });

  // Initialize user
  const { mutateAsync: initUser } = useMutation(
    (params: UserCreate) => UserService.initUser(params),
    {
      onMutate: async () => {
        setIsInitLoading(true);
        await queryClient.cancelQueries(queryKey);
      },
      onSuccess() {
        queryClient.invalidateQueries(queryKey);
      },
      onSettled() {
        setIsInitLoading(false);
      },
      onError: (error) => {
        message.error("用户初始化失败: " + (error as Error).message);
      },
    }
  );

  // Edit user
  const { mutateAsync: editUser } = useMutation(
    (params: { userId: string; userData: Partial<UserCreate> }) =>
      UserService.editUser(params.userId, params.userData),
    {
      onMutate: async ({ userId, userData }) => {
        await queryClient.cancelQueries(queryKey);
        const previousUser = queryClient.getQueryData<User>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<User | undefined>(queryKey, (oldUser) => {
          return oldUser ? { ...oldUser, ...userData } : oldUser;
        });
        return { previousUser };
      },
      onSuccess() {},
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (error, _, context) => {
        message.error("用户信息修改失败: " + (error as Error).message);
        if (context?.previousUser) {
          queryClient.setQueryData(queryKey, context.previousUser);
        }
      },
    }
  );

  return {
    user,
    isLoadingUser,
    initUser,
    editUser,
    isEditLoading,
    isInitLoading,
  };
}
