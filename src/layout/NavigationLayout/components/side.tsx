import {
  MaterialSymbolsAccountBalanceWallet,
  MaterialSymbolsAddRounded,
  MaterialSymbolsArrowBackIosNewRounded,
  MaterialSymbolsArrowForwardIosRounded,
  MaterialSymbolsToolsWrench,
  MdiArrowDownCircle,
  MdiArrowUpCircle,
  SolarCardBoldDuotone,
  SolarHashtagBold,
  TablerTransactionDollar,
} from "@/assets/icon";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";

import { ConfigProvider, Menu, message, type MenuProps } from "antd";
import {
  Button,
  Card,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  User,
} from "@nextui-org/react";
import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountModal from "@/components/AccountModal";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { ipcDevtoolMain, ipcExportCsv, ipcOpenFolder } from "@/service/ipc";
import {
  IcBaselineModeEdit,
  MaterialSymbolsBook4,
  MaterialSymbolsEditDocumentOutlineRounded,
  MaterialSymbolsHelpOutline,
  SelectorIcon,
  TablerSettings,
  UimGraphBar,
} from "./icon";
import TransactionModal from "@/components/TransactionModal";
import { useSideData } from "@/api/hooks/side";
import Decimal from "decimal.js";
import DataImportModal from "./data-import";
import CommonDateRangeFilter from "@/components/CommonDateRangeFilter";
import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import ExpandTreeMenu, { TreeNode } from "@/components/ExpandTreeMenu";
import { useModal } from "@/components/GlobalConfirmModal";
import AccountIconRender from "@/components/AccountIconRender";
import { AppPathAtom, AvatarAtom, BookAtom, LicenseAtom } from "@/globals";
import { useAtom, useAtomValue } from "jotai";
import Setting from "@/pages/Setting";
import BookModal from "@/components/BookModal";
import { TransactionService } from "@/api/services/TransactionService";
import dayjs from "dayjs";
import { FinancialOperation } from "@/api/db/manager";
import { operationTranslations } from "@/components/Transactions/contant";
import { indexDB } from "@/lib/indexdb";
import ExportModal from "@/components/ExportModal";
export interface SideProps {}
const now = new Date();
const Side: FC<SideProps> = () => {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const menuList = [
    {
      key: "home",
      href: "/",
      title: "首页",
      icon: <UimGraphBar />,
    },
    {
      key: "transactions",
      href: "/transactions",
      title: "流水",
      icon: <TablerTransactionDollar />,
    },
    {
      key: "calendar",
      href: "/calendar",
      title: "日历",
      icon: <MaterialSymbolsCalendarMonth />,
    },
    {
      key: "tags",
      href: "/tags",
      title: "标签",
      icon: <SolarHashtagBold />,
    },

    {
      key: "books",
      href: "/books",
      title: "账本",
      icon: <MaterialSymbolsBook4 />,
    },
    {
      key: "settings",
      href: "/settings",
      title: "设置",
      icon: <TablerSettings />,
    },
  ];
  // if (import.meta.env.DEV) {
  //   menuList.push({
  //     key: "devtool",
  //     href: "/devtool",
  //     title: "开发者工具",
  //     icon: <MaterialSymbolsToolsWrench />,
  //   });
  // }
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const { assets, deleteAsset } = useAssetsService();
  const { liabilities, deleteLiability } = useLiabilityService();
  const { incomes, deleteIncome } = useIncomeService();
  const { expenses, deleteExpense } = useExpenseService();
  const [editData, setEditData] = useState<any>();
  const [modalType, setModalType] = useState<
    "income" | "expense" | "asset" | "liability"
  >();

  const [month, setMonth] = useState<[Date, Date]>(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [start, end];
  });
  const timeFilter = useMemo(() => {
    return {
      startDate: month[0].getTime(),
      endDate: month[1].getTime(),
    };
  }, [month]);
  const { assetsData, liabilitiesData, expenditureData, incomeData } =
    useSideData(timeFilter);

  const items1: TreeNode[] = [
    {
      onTitleClick: () => {
        navigate("/assets");
      },
      key: "asset",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>资产</div>
          <span className=" text-default-500 flex items-center gap-1">
            <div>{assetsData?.totalAmount}</div>
          </span>
        </div>
      ),
      icon: <MaterialSymbolsAccountBalanceWallet />,
      children: [
        {
          key: "new_assets",
          label: "新增资产",
          hasMore: false,
          onTitleClick: () => {
            setShowAccountModal(true);
            setModalType("asset");
          },
          icon: <MaterialSymbolsAddRounded />,
        },
        ...(assets || []).map((item) => {
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/assets/${item.id}`);
            },
            icon: (
              <AccountIconRender emojiSize="0.80em" icon={item.icon ?? ""} />
            ),
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{assetsData?.assetAmounts?.get(item.id) ?? "0.00"}</div>
              </div>
            ),
          };
        }),
      ],
    },
    {
      key: "liability",
      onTitleClick: () => {
        navigate("/liabilities");
      },
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>负债</div>
          <span className=" text-default-500">
            -{liabilitiesData?.totalAmount}
          </span>
        </div>
      ),
      icon: <SolarCardBoldDuotone />,
      children: [
        {
          key: "new_liability",
          label: "新增负债",
          hasMore: false,
          icon: <MaterialSymbolsAddRounded />,
          onTitleClick: () => {
            setShowAccountModal(true);
            setModalType("liability");
          },
        },
        ...(liabilities || []).map((item) => {
          const liabilityAmount = liabilitiesData?.liabilityAmounts?.get(
            item.id
          );
          const displayAmount =
            liabilityAmount && liabilityAmount !== "0.00"
              ? `-${liabilityAmount}`
              : "0.00";

          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/liabilities/${item.id}`);
            },
            icon: (
              <AccountIconRender emojiSize="0.80em" icon={item.icon ?? ""} />
            ),
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{displayAmount}</div>
              </div>
            ),
          };
        }),
      ],
    },
  ];
  const items2: TreeNode[] = [
    {
      key: "income",
      onTitleClick: () => {
        navigate("/income");
      },
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>收入</div>
          <span className=" text-default-500">{incomeData?.totalAmount}</span>
        </div>
      ),
      icon: <MdiArrowDownCircle />,
      children: [
        {
          key: "new_income",
          label: "新增收入",
          icon: <MaterialSymbolsAddRounded />,
          onTitleClick: () => {
            setShowAccountModal(true);
            setModalType("income");
          },
        },
        ...(incomes || []).map((item) => {
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/income/${item.id}`);
            },
            icon: (
              <AccountIconRender emojiSize="0.80em" icon={item.icon ?? ""} />
            ),
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{incomeData?.incomeAmounts?.get(item.id) ?? "0.00"}</div>
              </div>
            ),
          };
        }),
      ],
    },
    {
      key: "expense",
      onTitleClick: () => {
        navigate("/expense");
      },
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>支出</div>
          <span className=" text-default-500">
            -{expenditureData?.totalAmount}
          </span>
        </div>
      ),
      icon: <MdiArrowUpCircle />,
      children: [
        {
          key: "new_expense",
          label: "新增支出",
          hasMore: false,
          icon: <MaterialSymbolsAddRounded />,
          onTitleClick: () => {
            setShowAccountModal(true);
            setModalType("expense");
          },
        },
        ...(expenses || []).map((item) => {
          const amount = expenditureData?.expenseAmounts?.get(item.id);
          const formattedAmount =
            amount && amount !== "0.00" ? `-${amount}` : "0.00";
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/expense/${item.id}`);
            },
            icon: (
              <AccountIconRender emojiSize="0.80em" icon={item.icon ?? ""} />
            ),
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{formattedAmount}</div>
              </div>
            ),
          };
        }),
      ],
    },
  ];

  const changeMonth = (direction: "prev" | "next") => {
    setMonth(([start, end]) => {
      const newStart = new Date(start);
      newStart.setMonth(start.getMonth() + (direction === "prev" ? -1 : 1));
      const newEnd = new Date(
        newStart.getFullYear(),
        newStart.getMonth() + 1,
        0
      );
      return [newStart, newEnd];
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(start.getDate()).padStart(
      2,
      "0"
    )} - ${end.getFullYear()}/${String(end.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(end.getDate()).padStart(2, "0")}`;
  };
  const [showPopover, setShowPopover] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const netWorth = new Decimal(assetsData?.totalAmount || 0).sub(
    new Decimal(liabilitiesData?.totalAmount || 0)
  );
  const balance = new Decimal(incomeData?.totalAmount || 0).sub(
    new Decimal(expenditureData?.totalAmount || 0)
  );

  const handleClick = () => {
    setShowDataImportModal(true);
  };
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();
  const modal = useModal();
  const onDelete = (key: string, type: string) => {
    modal.showModal({
      title: "删除",
      description: "确定删除吗？删除之后关联流水数据对应账户会被设置为空",
      onCancel: () => {},
      onConfirm: () => {
        switch (type) {
          case "asset":
            deleteAsset(key);
            break;
          case "liability":
            deleteLiability(key);
            break;
          case "income":
            deleteIncome(key);
            break;
          case "expense":
            deleteExpense(key);
            break;
        }
      },
    });
  };
  const onEdit = (key: string, type: string) => {
    setShowAccountModal(true);
    setModalType(type as "asset" | "liability" | "income" | "expense");
    const data = [
      ...(assets ?? []),
      ...(liabilities ?? []),
      ...(incomes ?? []),
      ...(expenses ?? []),
    ].find((item) => item.id === key);

    setEditData(data);
  };
  const ignorePath = ["/settings", "/", "/transactions", "/tags"];
  useEffect(() => {
    if (ignorePath.includes(pathname)) {
      setSelectedKey(undefined);
    }
  }, [pathname]);
  const book = useAtomValue(BookAtom);
  const [loading, setLoading] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);

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
        message.error("打开文件夹失败");
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
  const isMac = window.platform.getOS() === "darwin";
  const [isShowBookModal, setIsShowBookModal] = useState(false);
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemHoverBg: "hsl(var(--nextui-default) / 0.4)",
            itemSelectedBg: "hsl(var(--nextui-default) / 0.4)",
            itemSelectedColor: "rgb(87 88 89 / var(--tw-text-opacity))",
            itemActiveBg: "hsl(var(--nextui-default) / 0.4)",
            /* 这里是你的组件 token */
          },
        },
      }}
    >
      <div className="h-full pb-3 pt-0 bg-white   w-full  app-draggable rounded-l-large">
        <div className="no-drag flex flex-col  h-full">
          <div
            className={cn("mt-4  ", {
              "mt-0": isMac,
            })}
          >
            <div className="mx-4 border border-[#F0F0F0] default-200 mb-2  rounded-md">
              <div className="w-full justify-between flex ">
                <div className="py-1 px-2 w-full flex items-center justify-start  mb-0">
                  <div
                    className="inline-flex items-start justify-start gap-3 rounded-small outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 z-10 aria-expanded:scale-[0.97] aria-expanded:opacity-70 subpixel-antialiased "
                    data-slot="trigger"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                  >
                    <div className="inline-flex items-center gap-0.5">
                      {book?.icon ? (
                        <AccountIconRender icon={book?.icon} />
                      ) : (
                        <MaterialSymbolsBook4 className="text-lg" />
                      )}
                      <span className="text-small text-inherit">
                        {book?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsShowBookModal(true)}
                  isIconOnly
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  <IcBaselineModeEdit className="text-base" />
                </Button>
              </div>
            </div>
            <div className="mb-4 text-sm text-default-600 flex items-center  px-4">
              <Button
                variant="light"
                radius="sm"
                size="sm"
                isIconOnly
                onClick={() => changeMonth("prev")}
              >
                <MaterialSymbolsArrowBackIosNewRounded />
              </Button>
              <Popover
                isOpen={showPopover}
                onOpenChange={setShowPopover}
                placement="bottom"
                showArrow
              >
                <PopoverTrigger>
                  <Button
                    startContent={
                      <MaterialSymbolsCalendarMonth className="text-base" />
                    }
                    size="sm"
                    variant="light"
                    radius="sm"
                  >
                    {formatDateRange(month[0], month[1])}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <CommonDateRangeFilter
                    onReset={() => {
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      const end = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                      );
                      setShowPopover(false);
                      setMonth([start, end]);
                    }}
                    onChange={(value) => {
                      setMonth([value.start, value.end]);
                      setShowPopover(false);
                    }}
                    value={{
                      start: month[0],
                      end: month[1],
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="light"
                radius="sm"
                size="sm"
                isIconOnly
                onClick={() => changeMonth("next")}
              >
                <MaterialSymbolsArrowForwardIosRounded />
              </Button>
            </div>
            <div
              className="mt-4 overflow-auto scrollbar  "
              style={{
                height: `calc(100vh - 316px)`,
              }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between pl-6 pr-3 text-xs font-medium text-default-500 mb-2">
                  <div className="">资产/负债</div>
                  <div className=" pr-3 ">
                    <Tooltip
                      content={`截止${month[1].getFullYear()}/${
                        month[1].getMonth() + 1
                      }的净资产`}
                    >
                      <div className="flex items-center gap-1">
                        <MaterialSymbolsHelpOutline />
                        <div>净资产: {netWorth.toFixed(2)}</div>
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="px-4 pr-2">
                  <ExpandTreeMenu
                    data={items1}
                    selectedKey={selectedKey}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onSelectionChange={setSelectedKey}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between pl-6 pr-3 text-xs font-medium text-default-500 mb-2">
                  <div className="">支出/收入</div>
                  <div className=" pr-3 ">
                    <Tooltip
                      content={`${month[0].getFullYear()}/${
                        month[0].getMonth() + 1
                      } - ${month[1].getFullYear()}/${
                        month[1].getMonth() + 1
                      }结余`}
                    >
                      <div className="flex items-center gap-1">
                        <MaterialSymbolsHelpOutline />
                        <div>结余: {balance.toFixed(2)}</div>
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div className="px-4 pr-2">
                  <ExpandTreeMenu
                    data={items2}
                    selectedKey={selectedKey}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onSelectionChange={setSelectedKey}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-3 grid-rows-2 gap-2 mt-4 justify-start px-4 mb-4">
                {menuList.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Button
                      key={item.key}
                      className={cn("justify-start h-full py-2 items-center", {
                        "font-semibold": isActive,
                        // "row-span-2 flex-col ": index === 0,
                      })}
                      onClick={() => {
                        if (item.key === "books") {
                          message.info("开发中");
                        } else {
                          switch (item.key) {
                            case "settings":
                              setShowSettingModal(true);
                              break;
                            case "devtool":
                              ipcDevtoolMain();
                              break;
                            default:
                              navigate(item.href);
                              break;
                          }
                        }
                      }}
                      startContent={
                        <span className="text-lg text-[#575859]">
                          {item.icon}
                        </span>
                      }
                      variant={isActive ? "flat" : "light"}
                      size="sm"
                      radius="sm"
                      // color={pathname === item.href ? "primary" : "default"}
                    >
                      {item.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col  mx-4 gap-2">
            <Button
              size="sm"
              radius="sm"
              isLoading={loading}
              color="default"
              variant="flat"
              onClick={() => setShowExportModal(true)}
            >
              导出流水数据
            </Button>
            <Button
              size="sm"
              radius="sm"
              variant="shadow"
              color="primary"
              onClick={handleClick}
            >
              导入CSV文件
            </Button>
          </div>
          <DataImportModal
            isOpen={showDataImportModal}
            onOpenChange={() => setShowDataImportModal(false)}
          />
          <AccountModal
            isOpen={showAccountModal}
            onOpenChange={(value) => {
              if (!value) {
                setEditData(undefined);
              }
              setShowAccountModal(value);
            }}
            data={editData}
            type={modalType ?? "income"}
          />
          <TransactionModal
            isOpen={showTransactionModal}
            onChange={(value) => setShowTransactionModal(value)}
          />
        </div>
      </div>
      <Setting isOpen={showSettingModal} setIsOpen={setShowSettingModal} />
      <BookModal
        book={book}
        isOpen={isShowBookModal}
        onOpenChange={setIsShowBookModal}
      />
      <ExportModal
        isOpen={showExportModal}
        isLoading={loading}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </ConfigProvider>
  );
};

export default Side;
