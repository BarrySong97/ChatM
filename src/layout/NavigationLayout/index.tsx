import DragTitle from "@/components/DragTitle";
import { NextUIProvider } from "@nextui-org/react";
import { FC, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TrafficLight from "@/components/TrafficLight";
import Side from "./components/side";
import AutoCheckUpdate from "@/components/AutoCheckUpdate";
import { useLocalStorageState, useRequest } from "ahooks";
import { LicenseService } from "@/api/services/LicenseService";
import { License } from "@/api/models/license";
import { message } from "antd";
import { ApiError } from "@/api/core/ApiError";
export interface AppLayoutProps {}
const AppLayout: FC<AppLayoutProps> = () => {
  const navigate = useNavigate();
  const [license, setLicense] = useLocalStorageState<License | null>(
    "license",
    {
      defaultValue: null,
    }
  );
  const [licenseStatus, setLicenseStatus] = useLocalStorageState<string>(
    "license-status",
    {
      defaultValue: "",
    }
  );
  useRequest(() => LicenseService.CheckLicense(license!), {
    ready: !!license && !import.meta.env.DEV,
    onSuccess: (data) => {
      setLicense(data);
      setLicenseStatus("ACTIVE");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            setLicenseStatus("DISABLED");
            message.error("你的许可证已失效");
            break;
          case 403:
            setLicenseStatus("EXPIRED");
            message.error("你的许可证已过期");
            break;
          case 404:
            setLicenseStatus("NOT_FOUND");
            message.error("许可证不存在");
            break;
          default:
            setLicenseStatus("DISABLED");
            message.error("许可证验证失败");
        }
      }
    },
  });
  return (
    <NextUIProvider navigate={navigate}>
      <div className="flex h-screen overflow-hidden ">
        <aside className="dark:bg-default-100 bg-white   h-screen w-[308px]  ">
          <Side />
        </aside>
        <div className="flex-1 bg-[#ECECEC]  ">
          <div
            style={{
              width: "100%",
            }}
            className="relative dark:bg-transparent h-[28px]"
          >
            <DragTitle className="absolute bg-[#ECECEC] dark:bg-transparent   top-0 w-full  py-3.5 flex justify-end  ">
              <TrafficLight isDev={false} />
            </DragTitle>
          </div>
          <div className="absolute top-6 bottom-2 bg-white rounded-large overflow-hidden left-[308px] right-2 dark:bg-transparent">
            <Outlet />
          </div>
        </div>
        {import.meta.env.DEV ? null : <AutoCheckUpdate />}
      </div>
    </NextUIProvider>
  );
};

export default AppLayout;
