import {
  MaterialSymbolsAccountBalanceWallet,
  MaterialSymbolsAddRounded,
  MaterialSymbolsArrowBackIosNewRounded,
  MaterialSymbolsArrowForwardIosRounded,
  MaterialSymbolsHome,
  MaterialSymbolsToolsWrench,
  MdiArrowDownCircle,
  MdiArrowUpCircle,
  SolarCardBoldDuotone,
  SolarHashtagBold,
  SolarSettingsBold,
  TablerTransactionDollar,
} from "@/assets/icon";
import { cn } from "@/lib/utils";
import { parseDate } from "@internationalized/date";

import { ConfigProvider, Menu, type MenuProps } from "antd";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  User,
} from "@nextui-org/react";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountModal from "@/components/AccountModal";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { ipcDevtoolMain } from "@/service/ipc";
import {
  MaterialSymbolsEditDocumentOutlineRounded,
  MaterialSymbolsHelpOutline,
} from "./icon";
import TransactionModal from "@/components/TransactionModal";
import { useSideData } from "@/api/hooks/side";
import Decimal from "decimal.js";
import DataImportModal from "./data-import";
import CommonDateRangeFilter from "@/components/CommonDateRangeFilter";
import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import ExpandTreeMenu, { TreeNode } from "@/components/ExpandTreeMenu";
import { useModal } from "@/components/GlobalConfirmModal";
export interface SideProps {}
const now = new Date();
type MenuItem = Required<MenuProps>["items"][number];
const Side: FC<SideProps> = () => {
  const menuList = [
    {
      key: "home",
      href: "/",
      title: "首页",
      icon: <MaterialSymbolsHome />,
    },
    {
      key: "transactions",
      href: "/transactions",
      title: "流水",
      icon: <TablerTransactionDollar />,
    },
    {
      key: "tags",
      href: "/tags",
      title: "标签",
      icon: <SolarHashtagBold />,
    },
    {
      key: "settings",
      href: "/settings",
      title: "设置",
      icon: <SolarSettingsBold />,
    },
  ];
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
  const { assetsData, liabilitiesData, expenditureData, incomeData } =
    useSideData({
      startDate: month[0].getTime(),
      endDate: month[1].getTime(),
    });

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
      icon: <MaterialSymbolsAccountBalanceWallet className="!text-base" />,
      children: [
        ...(assets || []).map((item) => {
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/assets/${item.id}`);
            },
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{assetsData?.assetAmounts?.get(item.id) ?? "0.00"}</div>
              </div>
            ),
          };
        }),
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
      icon: <SolarCardBoldDuotone className="!text-base" />,
      children: [
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
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{displayAmount}</div>
              </div>
            ),
          };
        }),
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
      icon: <MdiArrowDownCircle className="!text-base" />,
      children: [
        ...(incomes || []).map((item) => {
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/income/${item.id}`);
            },
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{incomeData?.incomeAmounts?.get(item.id) ?? "0.00"}</div>
              </div>
            ),
          };
        }),
        {
          key: "new_income",
          label: "新增收入",
          icon: <MaterialSymbolsAddRounded />,
          onTitleClick: () => {
            setShowAccountModal(true);
            setModalType("income");
          },
        },
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
      icon: <MdiArrowUpCircle className="!text-base" />,
      children: [
        ...(expenses || []).map((item) => {
          const amount = expenditureData?.expenseAmounts?.get(item.id);
          const formattedAmount =
            amount && amount !== "0.00" ? `-${amount}` : "0.00";
          return {
            key: item.id,
            onTitleClick: () => {
              navigate(`/category/expense/${item.id}`);
            },
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>{formattedAmount}</div>
              </div>
            ),
          };
        }),
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
  const [selectKeys, setSelectKeys] = useState<string>();
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
      <div className="dark:bg-default-100 bg-default/40 bg-[#ECECEC] h-screen no-drag  py-6  w-full  ">
        <div className="flex items-center justify-between px-4 ">
          <User
            name="BarrySong97"
            description="BarrySong97@gmail.com"
            avatarProps={{
              radius: "sm",
              size: "sm",
              src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            }}
          />
          <div>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              className="bg-white"
              onClick={() => {
                setShowTransactionModal(true);
              }}
            >
              <MaterialSymbolsEditDocumentOutlineRounded className="text-lg" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 justify-start px-4 mb-4">
          {menuList.map((item) => {
            return (
              <Button
                key={item.key}
                className={cn("justify-start", {
                  "font-semibold": pathname === item.href,
                })}
                onClick={() => {
                  navigate(item.href);
                }}
                startContent={
                  <span className="text-lg text-[#575859]">{item.icon}</span>
                }
                variant={pathname !== item.href ? "light" : "flat"}
                size="sm"
                radius="sm"
                // color={pathname === item.href ? "primary" : "default"}
              >
                {item.title}
              </Button>
            );
          })}
          <Button
            onClick={ipcDevtoolMain}
            radius="sm"
            className="justify-start"
            size="sm"
            startContent={
              <MaterialSymbolsToolsWrench className="text-lg text-[#575859]" />
            }
            variant="light"
          >
            开发者工具
          </Button>
        </div>
        <div className="mb-4 text-sm text-default-600 flex items-center justify-between px-4">
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
                  const start = new Date(now.getFullYear(), now.getMonth(), 1);
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
            height: `calc(100vh - ${menuList.length * 40 + 220}px)`,
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
                  } - ${month[1].getFullYear()}/${month[1].getMonth() + 1}结余`}
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

        <div className="flex justify-center">
          <Button
            size="sm"
            radius="sm"
            onClick={handleClick}
            className="w-full mx-4"
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
          onOpenChange={() => setShowAccountModal(false)}
          data={editData}
          type={modalType ?? "income"}
        />
        <TransactionModal
          isOpen={showTransactionModal}
          onChange={(value) => setShowTransactionModal(value)}
        />
      </div>
    </ConfigProvider>
  );
};

export default Side;
