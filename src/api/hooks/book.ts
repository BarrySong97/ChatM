import { useMutation, useQuery, useQueryClient } from "react-query";
import { Book } from "@db/schema";
import { BookService } from "../services/BookService";
import { useState } from "react";
import { message } from "antd";
import { BookAtom } from "@/globals";
import { useSetAtom } from "jotai";

export type EditBook = {
  name?: string;
  isDefault?: number;
  isCurrent?: number;
};

export function useBookService() {
  const queryClient = useQueryClient();
  const queryKey = ["books"];

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch book list
  const { data: books, isLoading: isLoadingBooks } = useQuery<
    Array<Book>,
    Error
  >(queryKey, () => BookService.listBooks(), {
    keepPreviousData: true,
  });

  // Create book
  const { mutateAsync: createBook } = useMutation(
    (params: { book: EditBook }) => BookService.createBook(params.book),
    {
      onMutate: async (params: { book: EditBook }) => {
        setIsCreateLoading(true);
        await queryClient.cancelQueries(queryKey);
        const previousBooks = queryClient.getQueryData<Array<Book>>(queryKey);
        queryClient.setQueryData<Array<Book>>(
          queryKey,
          (oldBooks = []) => oldBooks
        );
        return { previousBooks };
      },
      onSuccess(data) {
        message.success("创建成功");
        queryClient.setQueryData<Array<Book>>(queryKey, (oldBooks = []) => [
          ...oldBooks,
          data,
        ]);
      },
      onSettled() {
        setIsCreateLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousBooks) {
          queryClient.setQueryData(queryKey, context.previousBooks);
        }
      },
    }
  );

  // Edit book
  const { mutateAsync: editBook } = useMutation(
    (params: { bookId: string; book: EditBook }) =>
      BookService.editBook(params.bookId, params.book),
    {
      onMutate: async ({ bookId, book }) => {
        await queryClient.cancelQueries(queryKey);
        const previousBooks = queryClient.getQueryData<Array<Book>>(queryKey);
        setIsEditLoading(true);
        queryClient.setQueryData<Array<Book>>(queryKey, (oldBooks = []) =>
          oldBooks.map((b) => (b.id === bookId ? { ...b, ...book } : b))
        );
        return { previousBooks };
      },
      onSuccess() {
        message.success("修改成功");
      },
      onSettled() {
        setIsEditLoading(false);
      },
      onError: (_error, _variables, context) => {
        if (context?.previousBooks) {
          queryClient.setQueryData(queryKey, context.previousBooks);
        }
      },
    }
  );

  // Delete book
  const { mutateAsync: deleteBook } = useMutation(
    (bookId: string) => BookService.deleteBook(bookId),
    {
      onMutate: async (bookId: string) => {
        await queryClient.cancelQueries(queryKey);
        const previousBooks = queryClient.getQueryData<Array<Book>>(queryKey);
        setIsDeleteLoading(true);
        queryClient.setQueryData<Array<Book>>(queryKey, (oldBooks = []) =>
          oldBooks.filter((b) => b.id !== bookId)
        );
        return { previousBooks };
      },
      onSuccess() {
        message.success("删除成功");
      },
      onSettled() {
        setIsDeleteLoading(false);
      },
      onError: (_error, _bookId, context) => {
        if (context?.previousBooks) {
          queryClient.setQueryData(queryKey, context.previousBooks);
        }
      },
    }
  );

  return {
    books,
    isLoadingBooks,
    editBook,
    deleteBook,
    createBook,
    isEditLoading,
    isDeleteLoading,
    isCreateLoading,
  };
}
