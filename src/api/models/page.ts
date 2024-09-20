export interface Page<T> {
  page: number;
  pageSize: number;
  totalPage: number;
  total: number;
  data: T[];
}
