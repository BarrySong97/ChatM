/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { License } from "../models/license";

export class LicenseService {
  // 激活许可证
  public static async ActivateLicense(
    licenseKey: string,
    email: string
  ): Promise<License> {
    const macId = await window.ipcRenderer.invoke("get-mac-address");
    return __request(OpenAPI, {
      method: "POST",
      url: "/license/activate",
      body: {
        email,
        licenseKey,
        macId,
      },
    });
  }

  // 取消激活许可证
  public static async DeactivateLicense(
    licenseKey: string,
    email: string
  ): Promise<void> {
    const macId = await window.ipcRenderer.invoke("get-mac-address");
    return __request(OpenAPI, {
      method: "POST",
      url: "/license/deactivate",
      body: {
        email,
        licenseKey,
        macId,
      },
    });
  }
}
