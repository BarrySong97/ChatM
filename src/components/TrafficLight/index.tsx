import {
  ClarityWindowCloseLine,
  ClarityWindowMaxLine,
  ClarityWindowRestoreLine,
  MaterialSymbolsToolsWrench,
  MingcuteMinimizeLine,
} from "@/assets/icon";
import { MAIN_SEND_RENDER_KEYS, TRAFFIC_LIGHT } from "@/constant";
import { ipcDevtoolProject, ipcWindowResize } from "@/service/ipc";
import { Button } from "@nextui-org/react";
import { FC, useEffect, useRef, useState } from "react";
export interface TrafficLightProps {
  className?: string;
  isMaximize?: boolean;
  isMinimize?: boolean;
  isDev?: boolean;
  isClose?: boolean;
}
const TrafficLight: FC<TrafficLightProps> = ({
  className,
  isClose = true,
  isDev = true,
  isMaximize = true,
  isMinimize = true,
}) => {
  const [maximize, setmaximize] = useState(false);
  const maximizeRef = useRef(false);
  useEffect(() => {
    window.ipcRenderer.on(MAIN_SEND_RENDER_KEYS.MAXIMIZE, () => {
      console.log("ipcRenderer.on", MAIN_SEND_RENDER_KEYS.MAXIMIZE);
      setmaximize(true);
    });
    window.ipcRenderer.on(MAIN_SEND_RENDER_KEYS.RESTORE, () => {
      console.log("ipcRenderer.on", MAIN_SEND_RENDER_KEYS.RESTORE);
      setmaximize(false);
    });
    window.ipcRenderer.on(MAIN_SEND_RENDER_KEYS.MINIMIZE, () => {
      console.log("ipcRenderer.on", MAIN_SEND_RENDER_KEYS.MINIMIZE);
      setmaximize(true);
    });
  }, []);

  const isMac = window.platform.getOS() === "darwin";
  const isProduction = window.platform.isProduction();
  if (isMac) {
    return null;
  }

  return (
    <div className={`absolute no-drag  top-0 right-0 flex ${className}`}>
      {isDev && !isProduction ? (
        <Button
          onClick={() => ipcDevtoolProject()}
          variant="light"
          isIconOnly
          size="sm"
          className="dark:text-foreground justify-center items-center"
          radius="sm"
        >
          <MaterialSymbolsToolsWrench className="text-lg text-zinc-500" />
        </Button>
      ) : null}
      {isMinimize ? (
        <Button
          onClick={() => {
            ipcWindowResize(TRAFFIC_LIGHT.MINIMIZE);
          }}
          variant="light"
          isIconOnly
          className="dark:text-foreground"
          size="sm"
          radius="none"
        >
          <MingcuteMinimizeLine className="text-lg mb-1" />
        </Button>
      ) : null}
      {isMaximize ? (
        <Button
          variant="light"
          onClick={() => {
            setmaximize(!maximize);
            maximizeRef.current = !maximize;
            ipcWindowResize(
              !maximize ? TRAFFIC_LIGHT.MAXIMIZE : TRAFFIC_LIGHT.RESTORE
            );
          }}
          className="dark:text-foreground"
          isIconOnly
          size="sm"
          radius="none"
        >
          {!maximize ? (
            <ClarityWindowMaxLine className="text-lg mb-1" />
          ) : (
            <ClarityWindowRestoreLine className="text-lg mb-1" />
          )}
        </Button>
      ) : null}
      {isClose ? (
        <Button
          onClick={() => ipcWindowResize(TRAFFIC_LIGHT.CLOSE)}
          variant="light"
          isIconOnly
          size="sm"
          className="mr-3"
          radius="none"
        >
          <ClarityWindowCloseLine className="text-lg dark:text-foreground mb-1 " />
        </Button>
      ) : null}
    </div>
  );
};

export default TrafficLight;
