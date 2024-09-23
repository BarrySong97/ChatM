import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import router from "./routes";
import { QueryClient, QueryClientProvider } from "react-query";
import { ModalProvider } from "./components/GlobalConfirmModal";
import { DarkModeProvider } from "./pages/providers";
import "@/components/Transactions/ag-grid-theme-builder.css";
import data from "@emoji-mart/data";
import { init } from "emoji-mart";

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
  </NextUIProvider>
);

postMessage({ payload: "removeLoading" }, "*");
