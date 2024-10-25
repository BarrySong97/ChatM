import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { update } from "./update";
import {
  IPC_EVENT_KEYS,
  MAIN_SEND_RENDER_KEYS,
  ModuleType,
  TRAFFIC_LIGHT,
} from "../../src/constant";
import { AppManager } from "./AppManager";
import { execute, runMigrate } from "./db";
import path from "path";
import getMAC, { isMAC } from "getmac";

globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = dirname(__filename);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.mjs");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

const LoginWindowSize = {
  width: 321,
  height: 444,
};
const MainWindowSize = {
  width: 1155,
  height: 811,
  minWidth: 1024,
  minHeight: 811,
};
type LiveWindow = {
  main: BrowserWindow | null; // 登录，项目导航，设置界面都在这个里面
  projects: Map<string, BrowserWindow>; // 单独打开的项目都在这个里面
};
const LiveWindow: LiveWindow = {
  main: null,
  projects: new Map(),
};
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
const isMac = process.platform === "darwin";
async function createWindow() {
  await runMigrate();
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 10,
      y: 10,
    },
    frame: false,
    ...MainWindowSize,
    webPreferences: {
      webSecurity: false,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
    },
  });
  win.on("moved", () => {
    if (!win?.isMaximized()) {
      win?.webContents.send(MAIN_SEND_RENDER_KEYS.RESTORE);
    }
  });
  win.on("minimize", () => {
    win?.webContents.send(MAIN_SEND_RENDER_KEYS.MINIMIZE);
  });
  // 在创建窗口时添加
  win.setBackgroundColor("rgba(0, 0, 0, 0)");
  win.webContents.on("will-navigate", () => {});
  // trafficLightListener(win);
  if (url) {
    win.loadURL(url);
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());

    win?.webContents.send("app-path", app.getAppPath());
  });

  if (import.meta.env.DEV) {
    win.webContents.openDevTools({
      mode: "detach",
    });
  }
  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  new AppManager(win, indexHtml, preload, url);
  // 把所有通信的代码都挂载上面
  // Apply electron-updater
  update(win);
}

ipcMain.handle("get-app-path", (_, relativePath) => {
  return app.getAppPath();
});

app.whenReady().then(() => {
  ipcMain.handle("db:execute", execute);
  ipcMain.handle("get-mac-address", async () => {
    const mac = getMAC();
    return mac;
  });
  createWindow();
});

app.on("window-all-closed", () => {
  win = null;
  app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
