import React from "react";
import { Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { ipcDevtoolMain } from "@/service/ipc";
import { MenuItem, menuList } from "./menu-list";

interface SideMenuListProps {
  setShowSettingModal: (show: boolean) => void;
}

const SideMenuList: React.FC<SideMenuListProps> = ({ setShowSettingModal }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const gridLayout =
    "grid grid-cols-3 grid-rows-2 gap-2 mt-4 justify-start px-4 mb-4";
  const listLayout = "flex flex-col gap-3";

  return (
    <div className={gridLayout}>
      {menuList.map((item: MenuItem, index: number) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.key}
            className={cn("justify-start h-full py-2 items-center", {
              "font-semibold": isActive,
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
              <span className="text-lg text-[#575859]">{item.icon}</span>
            }
            variant={isActive ? "flat" : "light"}
            size="sm"
            radius="sm"
          >
            {item.title}
          </Button>
        );
      })}
    </div>
  );
};

export default SideMenuList;
