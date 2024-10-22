import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import { MaterialSymbolsBook4, TablerSettings, UimGraphBar } from "./icon";
import { SolarHashtagBold, TablerTransactionDollar } from "@/assets/icon";
import { Icon } from "@iconify/react";

export interface MenuItem {
  key: string;
  href: string;
  title: string;
  icon: JSX.Element;
  tooltip?: string;
}

export const menuList: MenuItem[] = [
  {
    key: "home",
    href: "/",
    tooltip: "快捷键 G + H跳转",
    title: "图表",
    icon: <UimGraphBar />,
  },
  {
    key: "transactions",
    href: "/transactions",
    tooltip: "快捷键 G + T跳转",
    title: "流水",
    icon: <TablerTransactionDollar />,
  },
  {
    key: "calendar",
    href: "/calendar",
    tooltip: "快捷键 G + C跳转",
    title: "日历",
    icon: <MaterialSymbolsCalendarMonth />,
  },
  {
    key: "tags",
    href: "/tags",
    title: "标签",
    tooltip: "快捷键 G + R跳转",
    icon: <SolarHashtagBold />,
  },
  {
    key: "books",
    href: "/books",
    tooltip: "快捷键 G + B跳转",
    title: "账本",
    icon: <MaterialSymbolsBook4 />,
  },
  {
    key: "settings",
    href: "/settings",
    tooltip: "快捷键 G + S跳转",
    title: "设置",
    icon: <Icon icon={"tabler:settings"} />,
  },
];
