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
import { FC, useEffect, useState } from "react";
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
  useEffect(() => {
    window.ipcRenderer.on(MAIN_SEND_RENDER_KEYS.MAXIMIZE, () => {
      setmaximize(true);
    });
    window.ipcRenderer.on(MAIN_SEND_RENDER_KEYS.RESTORE, () => {
      setmaximize(false);
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
          className="dark:text-foreground"
          radius="sm"
        >
          <MaterialSymbolsToolsWrench className="text-lg text-zinc-500" />
        </Button>
      ) : null}
      {isMinimize ? (
        <Button
          onClick={() => ipcWindowResize(TRAFFIC_LIGHT.MINIMIZE)}
          variant="light"
          isIconOnly
          className="dark:text-foreground"
          size="sm"
          radius="sm"
        >
          <MingcuteMinimizeLine className="text-lg" />
        </Button>
      ) : null}
      {isMaximize ? (
        <Button
          variant="light"
          onClick={() => {
            setmaximize(!maximize);
            ipcWindowResize(
              !maximize ? TRAFFIC_LIGHT.MAXIMIZE : TRAFFIC_LIGHT.RESTORE
            );
          }}
          className="dark:text-foreground"
          isIconOnly
          size="sm"
          radius="sm"
        >
          {!maximize ? (
            <ClarityWindowMaxLine className="text-lg" />
          ) : (
            <ClarityWindowRestoreLine className="text-lg" />
          )}
        </Button>
      ) : null}
      {isClose ? (
        <Button
          onClick={() => ipcWindowResize(TRAFFIC_LIGHT.CLOSE)}
          variant="light"
          isIconOnly
          size="sm"
          radius="sm"
        >
          <ClarityWindowCloseLine className="text-lg dark:text-foreground" />
        </Button>
      ) : null}
    </div>
  );
};

export default TrafficLight;
