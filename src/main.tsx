import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import router from "./routes";
import { QueryClient, QueryClientProvider } from "react-query";
import { ModalProvider } from "./components/GlobalConfirmModal";
import { DarkModeProvider } from "./pages/providers";
import { DbProvider } from "./api/db/provider";
// import { seed } from "./db";
const queryClient = new QueryClient();
window.global = globalThis;
// seed();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <DbProvider>
    <DarkModeProvider>
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
    </DarkModeProvider>
  </DbProvider>
);

postMessage({ payload: "removeLoading" }, "*");
