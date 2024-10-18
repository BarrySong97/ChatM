import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { Button, NextUIProvider } from "@nextui-org/react";
import router from "./routes";
import { QueryClient, QueryClientProvider } from "react-query";
import { ModalProvider } from "./components/GlobalConfirmModal";
import { DarkModeProvider } from "./pages/providers";
import "@/components/Transactions/ag-grid-theme-builder.css";
import data from "@emoji-mart/data";
import { init } from "emoji-mart";
import { ipcDevtoolMain } from "./service/ipc";
import { MaterialSymbolsToolsWrench } from "./assets/icon";

init({ data });
// import { seed } from "./db";
const queryClient = new QueryClient();
window.global = globalThis;
// seed();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <NextUIProvider>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <RouterProvider
          router={router}
          fallbackElement={<p>Initial Load...</p>}
        />
      </ModalProvider>
    </QueryClientProvider>
    {import.meta.env.DEV && (
      <Button
        isIconOnly
        radius="full"
        color="primary"
        onClick={() => {
          ipcDevtoolMain();
        }}
        className="absolute bottom-10 z-50 right-10"
      >
        <MaterialSymbolsToolsWrench />
      </Button>
    )}
  </NextUIProvider>
);

postMessage({ payload: "removeLoading" }, "*");
