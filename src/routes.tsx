import { createHashRouter } from "react-router-dom";
import AppLayout from "./layout/NavigationLayout";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
// import DataMapping from "./pages/DataMapping";
import Category from "./pages/Category";
import Transactions from "./pages/Transactions";
import Lia from "./pages/Lia";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Settings from "./pages/Settings";
import Tags from "./pages/Tags";

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
        path: "/tags",
        element: <Tags />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      {
        path: "/liabilities",
        element: <Lia />,
      },
      {
        path: "/income",
        element: <Income />,
      },
      {
        path: "/expense",
        element: <Expense />,
      },
      {
        path: "/category/:type/:id",
        element: <Category />,
      },
      {
        path: "/settings",
        element: <Settings />,
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
