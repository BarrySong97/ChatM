import DragTitle from "@/components/DragTitle";
import { Button, cn, Divider, NextUIProvider } from "@nextui-org/react";
import { FC, useState } from "react";
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
import InitialModal from "./components/initial-modal";
import { MaterialSymbolsToolsWrench } from "@/assets/icon";
import { ipcDevtoolMain, ipcExportCsv, ipcOpenFolder } from "@/service/ipc";
import { RaycastCMDK } from "@/components/Command";
import ExportModal from "@/components/ExportModal";
import {
  AccountModalTypeAtom,
  BookAtom,
  ShowBatchAddAccountModalAtom,
  ShowExportModalAtom,
} from "@/globals";
import { useAtom, useAtomValue } from "jotai";
import dayjs from "dayjs";
import { operationTranslations } from "@/components/Transactions/contant";
import { FinancialOperation } from "@/api/db/manager";
import Decimal from "decimal.js";
import { TransactionService } from "@/api/services/TransactionService";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useHotkeys } from "react-hotkeys-hook";
import BatchAddAccountModal from "@/components/BatchAddAccountModal";
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

  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useAtom(ShowExportModalAtom);
  const book = useAtomValue(BookAtom);
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const handleExport = async (startDate: Date, endDate: Date) => {
    try {
      const headers = [
        "日期",
        "描述",
        "金额",
        "类型",
        "来源账户",
        "目标账户",
        "标签",
        "备注",
      ];
      const transactions = await TransactionService.getAllTransactions(
        book?.id ?? "",
        {
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
        }
      );
      if (transactions.length === 0) {
        message.warning("没有数据可以导出");
        return;
      }
      const res = await ipcOpenFolder();
      if (!res) {
        // message.error("打开文件夹失败");
        return;
      }
      const filePath = `${res}/流记数据导出-${dayjs(startDate).format(
        "YYYY-MM-DD"
      )}-${dayjs(endDate).format("YYYY-MM-DD")}.csv`;
      const csvData = [headers.join(",")];
      setLoading(true);
      transactions.forEach((t) => {
        const sourceAccount =
          [
            ...(assets || []),
            ...(liabilities || []),
            ...(incomes || []),
            ...(expenses || []),
          ].find((a) => a.id === t.source_account_id)?.name || "";
        const destAccount =
          [
            ...(assets || []),
            ...(liabilities || []),
            ...(incomes || []),
            ...(expenses || []),
          ].find((a) => a.id === t.destination_account_id)?.name || "";
        const tagNames = t.transactionTags
          ?.map((tt) => {
            if (tt.tag) {
              return `#${tt.tag.name}`;
            }
          })
          .join(" ");

        const type =
          operationTranslations[t.type as unknown as FinancialOperation];

        const row = [
          dayjs(t.transaction_date).format("YYYY-MM-DD HH:mm:ss"),
          t.content || "",
          new Decimal(t.amount || 0).dividedBy(100).toString(),
          type || "",
          sourceAccount,
          destAccount,
          tagNames,
          t.remark || "",
        ];

        csvData.push(row.join(","));
      });
      const csvString = csvData.join("\n");
      await ipcExportCsv(filePath, csvString);
      setLoading(false);
      message.success("导出成功");
      setShowExportModal(false);
    } catch (error) {
      message.error("导出失败");
    }
  };
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
  const [showBatchAddAccountModal, setShowBatchAddAccountModal] = useAtom(
    ShowBatchAddAccountModalAtom
  );
  const accountType = useAtomValue(AccountModalTypeAtom);
  return (
    <>
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
                "absolute flex top-2.5 flex shadow-lg bottom-2.5 bg-white rounded-large overflow-hidden left-[70px] right-2.5 dark:bg-transparent",
                {
                  "top-8": !isMac,
                }
              )}
            >
              <aside className="my-2.5  min-w-[308px]  rounded-r-large  ">
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
        <InitialModal />
        <ExportModal
          isOpen={showExportModal}
          isLoading={loading}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
        <BatchAddAccountModal
          isOpen={showBatchAddAccountModal}
          onOpenChange={setShowBatchAddAccountModal}
          type={accountType}
        />
      </NextUIProvider>
      <RaycastCMDK />
    </>
  );
};

export default AppLayout;
