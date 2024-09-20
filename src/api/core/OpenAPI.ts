/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from "./ApiRequestOptions";

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: "include" | "omit" | "same-origin";
  TOKEN?: string | Resolver<string> | undefined;
  USERNAME?: string | Resolver<string> | undefined;
  PASSWORD?: string | Resolver<string> | undefined;
  HEADERS?: Headers | Resolver<Headers> | undefined;
  ENCODE_PATH?: ((path: string) => string) | undefined;
};
const dev_url = "http://localhost:3000";
const prod_url = "https://www.flowm.cc/api";

export const OpenAPI: OpenAPIConfig = {
  BASE: import.meta.env.DEV ? dev_url : prod_url,
  VERSION: "1.5",
  WITH_CREDENTIALS: false,
  CREDENTIALS: "include",
  TOKEN: window.localStorage.getItem("token") ?? "",
  USERNAME: undefined,
  PASSWORD: undefined,
  HEADERS: undefined,
  ENCODE_PATH: undefined,
};
