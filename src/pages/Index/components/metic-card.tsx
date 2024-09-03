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

interface FinancialItemProps {
  title: string;
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
  return (
    <Card shadow="sm" radius="sm" className="bg-white p-4 rounded-lg h-full">
      <div className="h-full flex-1 flex flex-col">
        <div>
          <div
            className="text-gray-400 text-sm font-medium  border-l-4 pl-2"
            style={{
              borderColor: `var(--chart-${type}-color)`,
            }}
          >
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
