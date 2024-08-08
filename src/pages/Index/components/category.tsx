import React from "react";

interface StockItemProps {
  title: string;
  percent: number;
  amount: number;
  color: string;
}

const StockItem: React.FC<StockItemProps> = ({
  title,
  color,
  percent,
  amount,
}) => {
  console.log(percent);

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md ${color} py-1`}
    >
      <div>
        <div className="text-white text-xs font-medium">{title}</div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="text-white text-xs font-medium">{amount}</div>
        <div className="text-white text-xs font-medium">{percent}%</div>
      </div>
    </div>
  );
};

export default StockItem;
