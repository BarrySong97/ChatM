import {
  BitcoinIconsTransactionsFilled,
  MaterialSymbolsAccountBalanceWallet,
  MaterialSymbolsAddRounded,
  MaterialSymbolsArrowBackIosNewRounded,
  MaterialSymbolsArrowForwardIosRounded,
  MaterialSymbolsDateRange,
  MaterialSymbolsHome,
  MaterialSymbolsToolsWrench,
  MdiArrowDownCircle,
  MdiArrowUpCircle,
  SolarCardBoldDuotone,
  SolarSettingsBold,
  TablerTransactionDollar,
} from "@/assets/icon";
import DarkModeButton from "@/components/DarkModeButton";
import { cn } from "@/lib/utils";
import type { DateValue } from "@react-types/calendar";
import { parseDate } from "@internationalized/date";

import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu, type MenuProps, type MenuTheme } from "antd";
import { ipcDevtoolMain, ipcSignout } from "@/service/ipc";
import {
  Avatar,
  Button,
  ButtonGroup,
  Calendar,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@nextui-org/react";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountModal from "@/components/AccountModal";
import { useQuery } from "react-query";
import { AssetsService } from "@/api/services/AssetsSevice";
import { useAssetsService } from "@/api/hooks/assets";
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

  const signout = async () => {
    await ipcSignout();
    navigate("/");
  };
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { assets } = useAssetsService();

  const items1: MenuItem[] = [
    {
      onTitleClick: () => {
        navigate("/assets");
      },
      key: "assets",
      label: (
        <div className="flex items-center justify-between">
          <div>资产</div>
          <span className="text-sm text-default-500">30k</span>
        </div>
      ),
      icon: <MaterialSymbolsAccountBalanceWallet className="!text-xl" />,
      children: [
        ...(assets || []).map((item) => {
          return {
            key: item.id,
            label: item.name,
          };
        }),
        {
          key: "new_assets",
          label: "新增资产",
          onClick: () => {
            setShowAccountModal(true);
          },
          icon: <MaterialSymbolsAddRounded />,
        },
      ],
    },
    {
      key: "liabilities",
      label: (
        <div className="flex items-center justify-between">
          <div>负债</div>
          <span className="text-sm text-default-500">-30k</span>
        </div>
      ),
      icon: <SolarCardBoldDuotone className="!text-xl" />,
      children: [
        { key: "baitiao", label: "白条" },
        { key: "huabei", label: "花呗" },
        { key: "new", label: "新增负债" },
      ],
    },
  ];
  const items2: MenuItem[] = [
    {
      key: "income",
      label: (
        <div className="flex items-center justify-between">
          <div>收入</div>
          <span className="text-sm text-default-500">30k</span>
        </div>
      ),
      icon: <MdiArrowDownCircle className="!text-xl" />,
      children: [{ key: "new", label: "新增收入" }],
    },
    {
      key: "expenses",
      label: (
        <div className="flex items-center justify-between">
          <div>支出</div>
          <span className="text-sm text-default-500">-30k</span>
        </div>
      ),
      icon: <MdiArrowUpCircle className="!text-xl" />,
      children: [{ key: "new", label: "新增支出" }],
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

  return (
    <div className="dark:bg-default-100 h-screen no-drag  p-6 pb-20 w-full overflow-auto ">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">记点</div>
        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
      </div>
      <div className="flex flex-col gap-2 mt-8 justify-start">
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
              startContent={<span className="text-xl">{item.icon}</span>}
              variant={pathname !== item.href ? "light" : "flat"}
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
          startContent={
            <span className="text-xl" style={{}}>
              <MaterialSymbolsToolsWrench />
            </span>
          }
          variant="light"
        >
          开发者工具
        </Button>
      </div>
      <div className="pl-2 mt-8">
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
          <div className="flex items-center justify-between text-sm font-medium text-default-500 mb-2">
            <div className="">资产/负债</div>
            <div className=" pr-3">净资产: 30k</div>
          </div>
          <div>
            <Menu
              className="!border-none"
              defaultSelectedKeys={["assets"]}
              mode="inline"
              items={items1}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-default-500 mb-2">
            <div className="">支出/收入</div>
            <div className=" pr-3">结余: 30k</div>
          </div>

          <div>
            <Menu
              className="!border-none"
              defaultOpenKeys={["sub1"]}
              mode="inline"
              items={items2}
            />
          </div>
        </div>
      </div>
      <AccountModal
        isOpen={showAccountModal}
        onOpenChange={() => setShowAccountModal(false)}
      />
    </div>
  );
};

export default Side;
