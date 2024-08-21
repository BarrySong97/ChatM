export type Page<T> = {
  list: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};
