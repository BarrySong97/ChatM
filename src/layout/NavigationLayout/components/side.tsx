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
import { MaterialSymbolsEditDocumentOutlineRounded } from "./icon";
import TransactionModal from "@/components/TransactionModal";
export interface SideProps {}
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
      key: "settings",
      href: "/navigation/setting",
      title: "设置",
      icon: <SolarSettingsBold />,
    },
  ];
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();

  const [modalType, setModalType] = useState<
    "income" | "expense" | "asset" | "liability"
  >();

  const items1: MenuItem[] = [
    {
      onTitleClick: () => {
        navigate("/assets");
      },
      key: "assets",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>资产</div>
          <span className=" text-default-500">30k</span>
        </div>
      ),
      icon: <MaterialSymbolsAccountBalanceWallet className="!text-base" />,
      children: [
        ...(assets || []).map((item) => {
          return {
            key: item.id,
            label: (
              <div className="flex items-center justify-between">
                <div>{item.name}</div>
                <div>333</div>
              </div>
            ),
          };
        }),
        {
          key: "new_assets",
          label: "新增资产",
          onClick: () => {
            setShowAccountModal(true);
            setModalType("asset");
          },
          icon: <MaterialSymbolsAddRounded />,
        },
      ],
    },
    {
      key: "liabilities",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>负债</div>
          <span className=" text-default-500">-30k</span>
        </div>
      ),
      icon: <SolarCardBoldDuotone className="!text-base" />,
      children: [
        ...(liabilities || []).map((item) => {
          return {
            key: item.id,
            label: item.name,
          };
        }),
        {
          key: "new_liability",
          label: "新增负债",
          onClick: () => {
            setShowAccountModal(true);
            setModalType("liability");
          },
        },
      ],
    },
  ];
  const items2: MenuItem[] = [
    {
      key: "income",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>收入</div>
          <span className=" text-default-500">30k</span>
        </div>
      ),
      icon: <MdiArrowDownCircle className="!text-base" />,
      children: [
        ...(incomes || []).map((item) => {
          return {
            key: item.id,
            label: item.name,
          };
        }),
        {
          key: "new_income",
          label: "新增收入",
          onClick: () => {
            setShowAccountModal(true);
            setModalType("income");
          },
        },
      ],
    },
    {
      key: "expenses",
      label: (
        <div className="flex text-xs items-center justify-between">
          <div>支出</div>
          <span className=" text-default-500">-30k</span>
        </div>
      ),
      icon: <MdiArrowUpCircle className="!text-base" />,
      children: [
        ...(expenses || []).map((item) => {
          return {
            key: item.id,
            label: item.name,
          };
        }),
        {
          key: "new_expense",
          label: "新增支出",
          onClick: () => {
            setShowAccountModal(true);
            setModalType("expense");
          },
        },
      ],
    },
  ];
  const [month, setMonth] = useState<[Date, Date]>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [start, end];
  });

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
              onClick={() => setShowTransactionModal(true)}
            >
              <MaterialSymbolsEditDocumentOutlineRounded className="text-lg" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 justify-start px-4">
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
        <div className="mt-4 overflow-auto scrollbar h-[calc(100vh-264px)] px-4">
          <div className="mb-4 text-sm text-default-600 flex items-center justify-between">
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
                <Button size="sm" variant="light" radius="sm">
                  {formatDateRange(month[0], month[1])}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  showShadow={false}
                  showMonthAndYearPickers
                  value={parseDate(month[1].toISOString().slice(0, 10))}
                  classNames={{
                    base: "shadow-none",
                  }}
                  isHeaderExpanded={true}
                  onFocusChange={(date) => {
                    const _month = date.month;
                    const year = date.year;
                    console.log(_month, year);

                    if (
                      month[1].getFullYear() !== year ||
                      month[1].getMonth() + 1 !== _month
                    ) {
                      setMonth([
                        new Date(year, _month - 1, 1),
                        new Date(year, _month, 0),
                      ]);
                    }
                  }}
                  aria-label="Date (No Selection)"
                />
                <Button
                  variant="flat"
                  radius="full"
                  size="sm"
                  onClick={() => {
                    setMonth([new Date(), new Date()]);
                    setShowPopover(false);
                  }}
                  className="my-2"
                >
                  当前月
                </Button>
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
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-medium text-default-500 mb-2">
              <div className="">资产/负债</div>
              <div className=" pr-3">净资产: 30k</div>
            </div>
            <div>
              <Menu
                className="!border-none"
                multiple={false}
                selectedKeys={[selectKeys ?? ""]}
                onSelect={({ key }) => {
                  setSelectKeys(key);
                }}
                mode="inline"
                items={items1}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-default-500 mb-2">
              <div className="">支出/收入</div>
              <div className=" pr-3">结余: 30k</div>
            </div>

            <div>
              <Menu
                className="!border-none"
                multiple={false}
                mode="inline"
                selectedKeys={[selectKeys ?? ""]}
                onSelect={({ key }) => {
                  setSelectKeys(key);
                }}
                items={items2}
              />
            </div>
          </div>
        </div>
        <AccountModal
          isOpen={showAccountModal}
          onOpenChange={() => setShowAccountModal(false)}
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
