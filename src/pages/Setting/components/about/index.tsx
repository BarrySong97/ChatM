import React, { FC, useEffect, useState } from "react";
import SettingWrapper from "../setting-wrapper";
import { useLocalStorageState } from "ahooks";
import { Button, Input } from "@nextui-org/react";
import Update from "@/components/update";
import ElectronImage from "@/components/Image";
import { LicenseService } from "@/api/services/LicenseService";
import to from "await-to-js";
import { message } from "antd";
import { License } from "@/api/models/license";
import { ApiError } from "@/api/core/ApiError";

export interface AboutProps {}
const About: FC<AboutProps> = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const isValidLicenseKey = (key: string): boolean => {
    const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return keyPattern.test(key);
  };
  const [email, setEmail] = useState("");

  const canActivate = isValidLicenseKey(licenseKey);
  const [loading, setLoading] = useState(false);
  const [license, setLicense] = useLocalStorageState<License | null>(
    "license",
    {
      defaultValue: null,
    }
  );
  useEffect(() => {
    setEmail(license?.email || "");
    setLicenseKey(license?.key || "");
  }, [license]);
  console.log(license);

  return (
    <SettingWrapper title="关于流记">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12  flex items-center justify-center">
              {/* Replace with actual logo */}
              <ElectronImage
                src={"/icon-side.png"}
                className="rounded-lg"
                alt="logo"
              />
            </div>
          </div>
          <div>
            <div className="font-bold">流记</div>
            <div className="text-sm text-gray-500">
              当前版本: {process.env.PACKAGE_VERSION}
            </div>
          </div>
        </div>
        <Update />
      </div>
      <div className="mt-8">
        <Input
          label="激活码: XXXX-XXXX-XXXX-XXXX"
          size="sm"
          radius="sm"
          className="mb-4"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
        />
        <Input
          label="邮箱"
          size="sm"
          radius="sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex justify-center gap-4">
          <Button
            color="danger"
            variant="solid"
            radius="sm"
            onClick={async () => {
              const [err, data] = await to(
                LicenseService.DeactivateLicense(licenseKey, email)
              );
              if (data) {
                setLicense(null);
                message.success("取消激活成功");
              }
              if (err) {
                message.error(err.message);
              }
            }}
            isDisabled={!license || license.status !== "ACTIVE"}
            size="sm"
            className="mt-4 w-[120px]"
          >
            取消激活
          </Button>
          <Button
            color="primary"
            variant="solid"
            radius="sm"
            onClick={async () => {
              if (canActivate) {
                const [err, data] = await to(
                  LicenseService.ActivateLicense(licenseKey, email)
                );
                if (data) {
                  setLicense(data);
                  switch (data.status) {
                    case "ACTIVE":
                      message.success("激活成功");
                      break;
                    case "INACTIVE":
                      message.error("激活码无效");
                      break;
                    case "EXPIRED":
                      message.error("激活码已过期");
                      break;
                    case "DISABLED":
                      message.error("激活码已禁用");
                      break;
                  }
                }
                if (err) {
                  if (err instanceof ApiError) {
                    setLicense(null);
                    if (err.status === 404) {
                      message.error("没有找到该激活码");
                    } else if (err.status === 400) {
                      message.error("激活码已被设备绑定，达到最大绑定数量");
                    } else if (err.status === 403) {
                      message.error("激活码已过期");
                    } else {
                      message.error(err.body.message);
                    }
                  } else {
                    message.error(err.message);
                  }
                }
              }
            }}
            isDisabled={!canActivate || !email || license?.status === "ACTIVE"}
            size="sm"
            className="mt-4 w-[120px]"
          >
            激活
          </Button>
        </div>
      </div>
    </SettingWrapper>
  );
};

export default About;
