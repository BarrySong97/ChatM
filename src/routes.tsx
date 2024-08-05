import { createHashRouter, redirect } from "react-router-dom";
import AppLayout from "./layout/NavigationLayout";
import Index from "./pages/Index";
import Account from "./pages/Account";
import Category from "./pages/Category";
import DataMapping from "./pages/DataMapping";

const router = createHashRouter([
  // 导航界面路由
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/mapping",
        element: <DataMapping />,
      },
    ],
  },
  // 登录页面路由
]);
export default router;
