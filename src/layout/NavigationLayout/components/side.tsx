import {
  MaterialSymbolsAccountBalanceWallet,
  MaterialSymbolsAddRounded,
  MaterialSymbolsArrowBackIosNewRounded,
  MaterialSymbolsArrowForwardIosRounded,
  MdiArrowDownCircle,
  MdiArrowUpCircle,
  SolarCardBoldDuotone,
} from "@/assets/icon";
import { cn } from "@/lib/utils";

import { ConfigProvider, message } from "antd";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountModal from "@/components/AccountModal";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { ipcExportCsv, ipcOpenFolder } from "@/service/ipc";
import { RiMore2Fill } from "./icon";
import TransactionModal from "@/components/TransactionModal";
import { useSideData } from "@/api/hooks/side";
import Decimal from "decimal.js";
import DataImportModal from "./data-import";
import { useModal } from "@/components/GlobalConfirmModal";
import AccountIconRender from "@/components/AccountIconRender";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";
import Setting from "@/pages/Setting";
import BookModal from "@/components/BookModal";
import { TransactionService } from "@/api/services/TransactionService";
import dayjs from "dayjs";
import { FinancialOperation } from "@/api/db/manager";
import { operationTranslations } from "@/components/Transactions/contant";
import ExportModal from "@/components/ExportModal";
import SideActions from "./SideActions";
import AccountTreeMenu from "./AccountTreeMenu";
import IncomeExpenseTreeMenu from "./IncomeExpenseTreeMenu";
import SideMenuList from "./SideMenuList";
import CommonDateRangeFilter from "@/components/CommonDateRangeFilter";
import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import BookSelector from "./BookSelector";
import { TreeNode } from "@/components/ExpandTreeMenu";

export interface SideProps {}
const now = new Date();
const Side: FC<SideProps> = () => {
  const [showSettingModal, setShowSettingModal] = useState(false);
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
          label: "新增资产账户",
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
          label: "新增负债账户",
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
          label: "新增收入账户",
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
          label: "新增支出账户",
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
            <BookSelector onEditClick={() => setIsShowBookModal(true)} />
            <div className="mb-4 text-sm text-default-600 flex items-center justify-between px-2">
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
                height: `calc(100vh - 326px)`,
              }}
            >
              <AccountTreeMenu
                items={items1}
                selectedKey={selectedKey}
                onDelete={onDelete}
                onEdit={onEdit}
                onSelectionChange={setSelectedKey}
                netWorth={netWorth}
                month={month}
              />
              <IncomeExpenseTreeMenu
                items={items2}
                selectedKey={selectedKey}
                onDelete={onDelete}
                onEdit={onEdit}
                onSelectionChange={setSelectedKey}
                balance={balance}
                month={month}
              />
            </div>
            <div>
              <SideMenuList setShowSettingModal={setShowSettingModal} />
            </div>
          </div>
          <SideActions
            loading={loading}
            onExport={() => setShowExportModal(true)}
            onImport={handleClick}
          />
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
