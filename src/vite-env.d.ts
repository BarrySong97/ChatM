/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import("electron").IpcRenderer;
  platform: {
    getOS: () => string;
    isProduction: () => boolean;
  };
  db_execute: (...args: any) => Promise<any>;
}
