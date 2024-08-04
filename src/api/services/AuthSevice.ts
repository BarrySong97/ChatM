/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { SigninBody } from "../models/Auth";
import { Projects } from "../models/Project";

export class AuthService {
  /**
   *
   * @param param0 登录
   * @returns
   */
  public static SignIn({
    requestBody,
  }: {
    requestBody: SigninBody;
  }): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/user/login",
      query: requestBody,
    });
  }
}
