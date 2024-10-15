import DragTitle from "@/components/DragTitle";
import { cn, Divider, NextUIProvider } from "@nextui-org/react";
import { FC } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TrafficLight from "@/components/TrafficLight";
import Side from "./components/side";
import AutoCheckUpdate from "@/components/AutoCheckUpdate";
import { useLocalStorageState, useRequest } from "ahooks";
import { LicenseService } from "@/api/services/LicenseService";
import { License } from "@/api/models/license";
import { message } from "antd";
import { ApiError } from "@/api/core/ApiError";
import ActionList from "./components/action-list";
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
    ready: !!license?.key && !import.meta.env.DEV,
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
  const isMac = window.platform.getOS() === "darwin";
  return (
    <NextUIProvider navigate={navigate}>
      <div
        className="flex h-screen overflow-hidden "
        style={{
          // background: `radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%)`,
          // background: `linear-gradient(to top, #dfe9f3 0%, white 100%)`,
          background: `radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%)`,
        }}
      >
        <aside className="my-2.5 w-[70px]  ">
          <ActionList />
        </aside>
        <div className="flex-1   ">
          <div
            style={{
              width: "100%",
            }}
            className="absolute left-0 right-0 dark:bg-transparent h-[28px]"
          >
            <DragTitle className="absolute  dark:bg-transparent   top-0 w-full  py-3.5 flex justify-end  ">
              <TrafficLight isDev={false} />
            </DragTitle>
          </div>
          <div
            className={cn(
              "absolute top-2.5 flex shadow-lg bottom-2.5 bg-white rounded-large overflow-hidden left-[70px] right-2.5 dark:bg-transparent",
              {
                "top-6": !isMac,
              }
            )}
          >
            <aside className="my-2.5  w-[308px]  rounded-r-large  ">
              <div className=" flex  h-full  rounded-r-large">
                <Side />
                <div className="py-2 bg-white">
                  <Divider className="bg-[#F0F0F0]" orientation="vertical" />
                </div>
              </div>
            </aside>
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </div>
        {import.meta.env.DEV ? null : <AutoCheckUpdate />}
      </div>
    </NextUIProvider>
  );
};

export default AppLayout;
