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

interface FinancialItemProps {
  title: string;
  value: number;
  changed: number;
  percentage: number;
}

const FinancialItem: React.FC<FinancialItemProps> = ({
  title,
  value,
  changed,
  percentage,
}) => {
  const isPositive = percentage >= 0;
  const arrowClass = isPositive ? "arrow-up" : "arrow-down";
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  const bgColorClass = isPositive ? "bg-green-500" : "bg-red-500";

  return (
    <Card
      shadow="sm"
      radius="sm"
      className="bg-white p-4 rounded-lg flex flex-row justify-between"
    >
      <div>
        <div className="text-black text-base font-medium">{title}</div>
        <div className="text-gray-400 text-[15px]">{value.toFixed(2)}</div>
      </div>
      <div className={`flex items-center ${colorClass}`}>
        <div className="text-right">
          <div className="text-base">{changed}</div>
          <div className="flex items-center gap-1">
            <span className="text-sm">{percentage.toFixed(2)}%</span>{" "}
            {percentage > 0 ? <MdiArrowTopRight /> : <MdiArrowBottomRight />}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FinancialItem;
