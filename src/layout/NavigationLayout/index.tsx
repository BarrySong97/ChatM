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
import Side from "./components/side";
import TrafficLight from "@/components/TrafficLight";
export interface AppLayoutProps {}
const AppLayout: FC<AppLayoutProps> = () => {
  const navigate = useNavigate();
  return (
    <NextUIProvider navigate={navigate}>
      <div className="flex h-screen overflow-hidden">
        <aside className="dark:bg-default-100 bg-[#F3F3F4] app-draggable h-screen w-[280px] pt-12 flex flex-col items-center justify-center">
          <Side />
        </aside>
        <div className="flex-1">
          <div
            style={{
              width: "100%",
            }}
            className="relative dark:bg-transparent h-6"
          >
            <DragTitle className="absolute dark:bg-transparent z-[99] top-0 w-full  py-3 flex justify-end  ">
              <TrafficLight isDev={false} />
            </DragTitle>
          </div>
          <div className="absolute top-0 bottom-0 overflow-auto left-[280px] right-0 dark:bg-transparent">
            <Outlet />
          </div>
        </div>
      </div>
    </NextUIProvider>
  );
};

export default AppLayout;
