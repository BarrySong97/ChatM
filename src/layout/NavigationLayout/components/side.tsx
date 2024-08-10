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
  Listbox,
  ListboxItem,
  Tooltip,
} from "@nextui-org/react";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
      title: "交易记录",
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
  const items1: MenuItem[] = [
    {
      key: "assets",
      label: (
        <div className="flex items-center justify-between">
          <div>资产</div>
          <span className="text-sm text-default-500">30k</span>
        </div>
      ),
      icon: <MaterialSymbolsAccountBalanceWallet className="!text-xl" />,
      children: [
        {
          key: "wechat",
          label: (
            <div className="flex items-center justify-between">
              <div>微信</div>
              <span className="text-sm text-default-500">30k</span>
            </div>
          ),
        },
        {
          key: "alipay",
          label: (
            <div className="flex items-center justify-between">
              <div>支付宝</div>
              <span className="text-sm text-default-500">30k</span>
            </div>
          ),
        },
        {
          key: "new_assets",
          label: "新增资产",
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
          <Button variant="light" radius="sm" size="sm" isIconOnly>
            <MaterialSymbolsArrowBackIosNewRounded />
          </Button>
          <div>2024/03/01 - 2024/03/31</div>
          <Button variant="light" radius="sm" size="sm" isIconOnly>
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
              defaultOpenKeys={["sub1"]}
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
    </div>
  );
};

export default Side;
