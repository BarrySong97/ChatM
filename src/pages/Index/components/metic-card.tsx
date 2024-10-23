import {
  MdiArrowBottomLeft,
  MdiArrowBottomRight,
  MdiArrowDown,
  MdiArrowDownCircle,
  MdiArrowTopRight,
  MdiArrowUp,
  MdiArrowUpCircle,
} from "@/assets/icon";
import { Card } from "@nextui-org/react";
import React from "react";
import NewworthChart from "./newworth-chart";
import { Icon } from "@iconify/react";

interface FinancialItemProps {
  title: string | React.ReactNode;
  value: string;
  type: "asset" | "liability" | "expense" | "income";
  chartData?: {
    label: string;
    data: number;
  }[];
}

const FinancialItem: React.FC<FinancialItemProps> = ({
  title,
  value,
  type,
  chartData,
}) => {
  const getIcon = () => {
    switch (type) {
      case "asset":
        return <Icon icon={"material-symbols:account-balance-wallet"} />;
      case "liability":
        return <Icon icon={"solar:card-bold-duotone"} />;
      case "expense":
        return <Icon icon={"mdi:arrow-up-circle"} />;
      case "income":
        return <Icon icon={"mdi:arrow-down-circle"} />;
    }
  };
  return (
    <Card shadow="sm" radius="sm" className="bg-white p-4 rounded-lg h-full">
      <div className="h-full flex-1 flex flex-col">
        <div>
          <div className=" text-sm font-medium flex items-center gap-1">
            <div
              className="text-lg"
              style={{
                color: `var(--chart-${type}-color)`,
              }}
            >
              {getIcon()}
            </div>
            {title}
          </div>
          <div
            style={{
              color: "rgb(17 24 39 / 1)",
            }}
            className="text-2xl font-semibold"
          >
            {value}
          </div>
        </div>
        {chartData ? <NewworthChart data={[...chartData]} /> : null}
      </div>
    </Card>
  );
};

export default FinancialItem;
