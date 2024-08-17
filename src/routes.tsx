import { createHashRouter } from "react-router-dom";
import AppLayout from "./layout/NavigationLayout";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
// import DataMapping from "./pages/DataMapping";
import Category from "./pages/Category";
import Transactions from "./pages/Transactions";

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
        path: "/assets",
        element: <Assets />,
      },
      {
        path: "/category/:id",
        element: <Category />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      // {
      //   path: "/mapping",
      //   element: <DataMapping />,
      // },
    ],
  },
  // 登录页面路由
]);
export default router;
