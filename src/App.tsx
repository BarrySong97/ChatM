import { useState } from "react";
import UpdateElectron from "@/components/update";
import logoVite from "./assets/logo-vite.svg";
import logoElectron from "./assets/logo-electron.svg";
import "./App.css";
import { RouterProvider, useNavigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import router from "./routes";

function App() {
  return (
    <NextUIProvider>
      <RouterProvider
        router={router}
        fallbackElement={<p>Initial Load...</p>}
      />
    </NextUIProvider>
  );
}

export default App;
