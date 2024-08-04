import {
  IPC_EVENT_KEYS,
  MAIN_SEND_RENDER_KEYS,
  ModuleType,
  TRAFFIC_LIGHT,
} from "../../src/constant";
import { BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs";
const isMac = process.platform === "darwin";
function resizeWindow(action: TRAFFIC_LIGHT) {
  const win = BrowserWindow.getFocusedWindow();
  switch (action) {
    case TRAFFIC_LIGHT.MAXIMIZE:
      win?.maximize();
      break;
    case TRAFFIC_LIGHT.MINIMIZE:
      win?.minimize();
      break;
    case TRAFFIC_LIGHT.RESTORE:
      win?.restore();
      break;
    case TRAFFIC_LIGHT.CLOSE:
      win?.close();
      break;
  }
}
function trafficLightListener(win?: BrowserWindow) {
  if (!isMac) {
    win?.on("maximize", () => {
      win?.webContents.send(MAIN_SEND_RENDER_KEYS.MAXIMIZE);
    });
    win?.on("restore", () => {
      win?.webContents.send(MAIN_SEND_RENDER_KEYS.RESTORE);
    });
    win?.on("resize", () => {
      if (!win?.isMaximized()) {
        win?.webContents.send(MAIN_SEND_RENDER_KEYS.RESTORE);
      }
    });
  }
}
const LoginWindowSize = {
  width: 321,
  height: 444,
};
const MainWindowSize = {
  width: 981,
  height: 710,
  minWidth: 981,
  minHeight: 710,
};
export class AppManager {
  // 初始化一些绑定的事件到main window上, ts上可以直接在构造函数的参数初始化
  constructor(
    private main: BrowserWindow, // 登录，项目导航，设置界面都在这个里面
    private indexHtml: string, // production 文件路径
    private preload: string, // preload 文件路径
    private url?: string, // dev server url
    private currentProject?: BrowserWindow // 当前打开的项目
  ) {
    trafficLightListener(this.main);
    this.initHandler();
  }
  // 登录修改主窗口大小
  [IPC_EVENT_KEYS.SIGN_IN]() {
    const mainWindow = this.main;
    mainWindow.setResizable(true);
    mainWindow.setSize(MainWindowSize.width, MainWindowSize.height);
    mainWindow.setMinimumSize(
      MainWindowSize.minWidth,
      MainWindowSize.minHeight
    );
    mainWindow.center();
  }
  // 退出修改主窗口大小
  [IPC_EVENT_KEYS.SIGN_OUT]() {
    const mainWindow = this.main;

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      mainWindow.setMinimumSize(LoginWindowSize.width, LoginWindowSize.height);
      mainWindow.setSize(0, 0);
    } else {
      mainWindow.setMinimumSize(LoginWindowSize.width, LoginWindowSize.height);
      mainWindow.setSize(0, 0);
    }
    mainWindow.setResizable(false);
    mainWindow.center();
  }
  // 打开开发者工具
  [IPC_EVENT_KEYS.DEV_TOOL]() {
    BrowserWindow.getFocusedWindow()?.webContents.openDevTools({
      mode: "detach",
    });
  }
  // 打开一个新项目
  [IPC_EVENT_KEYS.OPEN_PROJECT](
    projectId: number,
    stage: ModuleType,
    moduleId: number,
    projectTitle: string,
    chatbot: boolean
  ) {
    const exist = this.currentProject;
    if (exist) {
      exist.show();
      return;
    }
    const childWindow = new BrowserWindow({
      width: 1512,
      height: 872,
      frame: false,
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 8, y: 6 },
      webPreferences: {
        preload: this.preload,
        nodeIntegration: true,
      },
    });
    childWindow.setMinimumSize(
      MainWindowSize.minWidth,
      MainWindowSize.minHeight
    );
    trafficLightListener(childWindow);
    const main = this.main;

    childWindow.on("closed", () => {
      this.currentProject = undefined;
      if (!main.isDestroyed()) {
        main.focus();
      }
    });
    const hash = `#/projectDetail/${projectId}/chatbot?moduleType=${stage}&moduleId=${moduleId}&projectTitle=${projectTitle}&chatbot=${chatbot}`;
    if (process.env.VITE_DEV_SERVER_URL) {
      childWindow.loadURL(`${this.url}${hash}`);
      childWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      childWindow.loadFile(this.indexHtml, { hash: hash });
    }
    this.currentProject = childWindow;
  }
  // 当操作右上角的自定义trafficlight的时候
  [IPC_EVENT_KEYS.WINDOW_RESIZE](action: TRAFFIC_LIGHT) {
    resizeWindow(action);
  }
  /**
   * 打开选择文件夹，用于导出窗口
   */
  async [IPC_EVENT_KEYS.OPEN_FOLDER](projectId: number) {
    const projectWindow = BrowserWindow.getFocusedWindow();
    if (projectWindow) {
      const res = await dialog.showOpenDialog(projectWindow, {
        properties: ["openDirectory"],
      });
      if (!res.canceled) {
        return res.filePaths[0];
      }
    }
  }

  // 根据数组对象生成csv文件
  async [IPC_EVENT_KEYS.SAVE_CSV_FILE](filename: string, dataArray: any) {
    const projectWindow = BrowserWindow.getFocusedWindow();
    if (projectWindow) {
      const res = await dialog.showSaveDialog(projectWindow, {
        defaultPath: filename,
      });
      if (res.filePath) {
        fs.writeFileSync(res.filePath, Buffer.from(dataArray));
        return res.filePath;
      }
    }
    return "";
  }
  [IPC_EVENT_KEYS.CHECK_SIGN_IN]() {}

  // 注册通信事件，就是上面这些枚举配置的函数
  initHandler() {
    for (const value of Object.values(IPC_EVENT_KEYS)) {
      ipcMain.handle(value, (_, ...args) => {
        const res = (this[value] as (...aggs: any) => void)(...args);
        return res;
      });
    }
  }
}
