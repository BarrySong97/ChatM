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
import {
  BookAtom,
  ShowDataImportModalAtom,
  ShowExportModalAtom,
  ShowTransactionModalAtom,
  ShowAccountModalAtom,
  AccountModalTypeAtom,
  ShowSettingModalAtom,
} from "@/globals";
import { useAtom, useAtomValue } from "jotai";
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
import { useQueryClient } from "react-query";
import { useHotkeys } from "react-hotkeys-hook";
import { Icon } from "@iconify/react";

export interface SideProps {}
const now = new Date();
const Side: FC<SideProps> = () => {
  const [showSettingModal, setShowSettingModal] = useAtom(ShowSettingModalAtom);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const [showAccountModal, setShowAccountModal] = useAtom(ShowAccountModalAtom);
  const { assets, deleteAsset } = useAssetsService();
  const { liabilities, deleteLiability } = useLiabilityService();
  const { incomes, deleteIncome } = useIncomeService();
  const { expenses, deleteExpense } = useExpenseService();
  const [editData, setEditData] = useState<any>();
  const [modalType, setModalType] = useAtom(AccountModalTypeAtom);

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

  const getIcon = (type: string) => {
    switch (type) {
      case "asset":
        return (
          <Icon
            style={{
              color: `var(--chart-${type}-color)`,
            }}
            icon={"material-symbols:account-balance-wallet"}
          />
        );
      case "liability":
        return (
          <Icon
            style={{
              color: `var(--chart-${type}-color)`,
            }}
            icon={"solar:card-bold-duotone"}
          />
        );
      case "expense":
        return (
          <Icon
            style={{
              color: `var(--chart-${type}-color)`,
            }}
            icon={"mdi:arrow-up-circle"}
          />
        );
      case "income":
        return (
          <Icon
            style={{
              color: `var(--chart-${type}-color)`,
            }}
            icon={"mdi:arrow-down-circle"}
          />
        );
    }
  };
  const items1: TreeNode[] = [
    {
      onTitleClick: () => {
        navigate("/assets");
      },
      key: "asset",
      tooltip: "快捷键 G + A 跳转",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>资产</div>
          <span className=" text-default-500 flex items-center gap-1">
            <div>{assetsData?.totalAmount}</div>
          </span>
        </div>
      ),
      icon: getIcon("asset"),
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
      tooltip: "快捷键 G + L 跳转",
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
      icon: getIcon("liability"),
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
      tooltip: "快捷键 G + I 跳转",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>收入</div>
          <span className=" text-default-500">{incomeData?.totalAmount}</span>
        </div>
      ),
      icon: getIcon("income"),
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
      tooltip: "快捷键 G + E 跳转",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>支出</div>
          <span className=" text-default-500">
            -{expenditureData?.totalAmount}
          </span>
        </div>
      ),
      icon: getIcon("expense"),
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
  const [showTransactionModal, setShowTransactionModal] = useAtom(
    ShowTransactionModalAtom
  );
  const [showExportModal, setShowExportModal] = useAtom(ShowExportModalAtom);

  const netWorth = new Decimal(assetsData?.totalAmount || 0).sub(
    new Decimal(liabilitiesData?.totalAmount || 0)
  );
  const balance = new Decimal(incomeData?.totalAmount || 0).sub(
    new Decimal(expenditureData?.totalAmount || 0)
  );

  const handleClick = () => {
    setShowDataImportModal(true);
  };
  const [showDataImportModal, setShowDataImportModal] = useAtom(
    ShowDataImportModalAtom
  );

  const [selectedKey, setSelectedKey] = useState<string>();
  const modal = useModal();
  const queryClient = useQueryClient();
  const onDelete = (key: string, type: string) => {
    modal.showModal({
      title: "删除",
      description: "确定删除吗？删除之后关联流水数据对应账户会被设置为空",
      onCancel: () => {},
      onConfirm: async () => {
        switch (type) {
          case "asset":
            await deleteAsset(key);
            break;
          case "liability":
            await deleteLiability(key);
            break;
          case "income":
            await deleteIncome(key);
            break;
          case "expense":
            await deleteExpense(key);
            break;
        }
        queryClient.invalidateQueries({ refetchActive: true });
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
          <div className={cn("mt-0 ")}>
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
                height: `calc(100vh - ${isMac ? "326px" : "340px"})`,
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
    </ConfigProvider>
  );
};

export default Side;
