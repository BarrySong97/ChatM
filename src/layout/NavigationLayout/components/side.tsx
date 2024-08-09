import {
  MaterialSymbolsAccountBalanceWallet,
  MaterialSymbolsHome,
  MaterialSymbolsToolsWrench,
  MdiArrowDownCircle,
  MdiArrowUpCircle,
  SolarCardBoldDuotone,
  SolarSettingsBold,
} from "@/assets/icon";
import DarkModeButton from "@/components/DarkModeButton";
import { ipcDevtoolMain, ipcSignout } from "@/service/ipc";
import { Button, Tooltip } from "@nextui-org/react";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export interface SideProps {}
const Side: FC<SideProps> = () => {
  const menuList = [
    {
      key: "home",
      href: "/",
      title: "首页",
      icon: <MaterialSymbolsHome />,
    },
    {
      key: "Account",
      href: "/assets",
      title: "资产/负债",
      icon: <MaterialSymbolsAccountBalanceWallet />,
    },
    {
      key: "Account",
      href: "/account",
      title: "支出",
      icon: <MdiArrowUpCircle />,
    },
    {
      key: "Account",
      href: "/account",
      title: "收入",
      icon: <MdiArrowDownCircle />,
    },
    {
      key: "Account",
      href: "/account",
      title: "负债",
      icon: <SolarCardBoldDuotone />,
    },
    {
      key: "settings",
      href: "/navigation/setting",
      title: "Settings",
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
  return (
    <div className="dark:bg-default-100 no-drag flex flex-col justify-between pb-4 w-12">
      {menuList.map((item) => {
        const isActive =
          pathname === item.href ||
          (pathname.includes("setting") && item.href.includes("setting"));

        return (
          <Tooltip
            className="dark:text-foreground"
            key={item.key}
            placement={"right"}
            content={item.title}
          >
            <Button
              style={{
                backgroundColor: isActive
                  ? "hsl(var(--nextui-default) / 0.4)"
                  : "",
                // width: "3.5rem",
              }}
              onClick={() => {
                navigate(item.href);
              }}
              // href={item.href}
              className="py-6 !px-0 min-w-12"
              radius="none"
              size="sm"
              variant="light"
            >
              <span className="text-lg text-default-700" style={{}}>
                {item.icon}
              </span>
            </Button>
          </Tooltip>
        );
      })}

      <div className="flex flex-col justify-center items-center">
        <>
          {window.platform.isProduction() ? (
            <DarkModeButton />
          ) : (
            <>
              {/* <DarkModeButton /> */}
              <Tooltip
                className="dark:text-foreground"
                placement={"right"}
                content={"Dev Tool"}
              >
                <Button
                  onClick={ipcDevtoolMain}
                  className="py-6 !px-0 !min-w-12 "
                  radius="none"
                  size="sm"
                  variant="light"
                >
                  <span className="text-lg text-default-700" style={{}}>
                    <MaterialSymbolsToolsWrench />
                  </span>
                </Button>
              </Tooltip>
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default Side;
