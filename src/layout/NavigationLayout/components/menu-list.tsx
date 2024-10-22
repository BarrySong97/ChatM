import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import { MaterialSymbolsBook4, TablerSettings, UimGraphBar } from "./icon";
import { SolarHashtagBold, TablerTransactionDollar } from "@/assets/icon";
import { Icon } from "@iconify/react";

export interface MenuItem {
  key: string;
  href: string;
  title: string;
  icon: JSX.Element;
}

export const menuList: MenuItem[] = [
  {
    key: "home",
    href: "/",
    title: "图表",
    icon: <UimGraphBar />,
  },
  {
    key: "transactions",
    href: "/transactions",
    title: "流水",
    icon: <TablerTransactionDollar />,
  },
  {
    key: "calendar",
    href: "/calendar",
    title: "日历",
    icon: <MaterialSymbolsCalendarMonth />,
  },
  {
    key: "tags",
    href: "/tags",
    title: "标签",
    icon: <SolarHashtagBold />,
  },
  {
    key: "books",
    href: "/books",
    title: "账本",
    icon: <MaterialSymbolsBook4 />,
  },
  {
    key: "settings",
    href: "/settings",
    title: "设置",
    icon: <Icon icon={"tabler:settings"} />,
  },
];
