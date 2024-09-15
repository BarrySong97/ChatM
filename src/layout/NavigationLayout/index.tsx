import DragTitle from "@/components/DragTitle";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NextUIProvider,
  User,
} from "@nextui-org/react";
import { FC } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TrafficLight from "@/components/TrafficLight";
import Side from "./components/side";
export interface AppLayoutProps {}
const AppLayout: FC<AppLayoutProps> = () => {
  const navigate = useNavigate();
  return (
    <NextUIProvider navigate={navigate}>
      <div className="flex h-screen overflow-hidden">
        <aside className="dark:bg-default-100 bg-white   h-screen w-[308px]  ">
          <Side />
        </aside>
        <div className="flex-1 bg-[#ECECEC]">
          <div
            style={{
              width: "100%",
            }}
            className="relative dark:bg-transparent "
          >
            <DragTitle className="absolute bg-[#ECECEC] dark:bg-transparent   top-0 w-full  py-3.5 flex justify-end  ">
              <TrafficLight isDev={false} />
            </DragTitle>
          </div>
          <div className="absolute top-6 bottom-2 bg-white rounded-large overflow-hidden left-[308px] right-2 dark:bg-transparent">
            <Outlet />
          </div>
        </div>
      </div>
    </NextUIProvider>
  );
};

export default AppLayout;
