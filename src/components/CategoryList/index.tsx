import Decimal from "decimal.js";
import React from "react";

interface CategoryItem {
  color?: string;
  content: string;
  amount: string;
}

interface CategoryListProps {
  items: CategoryItem[];
}

const CategoryList: React.FC<CategoryListProps> = ({ items }) => {
  const totalAmount = items.reduce(
    (acc, item) => new Decimal(acc).add(new Decimal(item.amount)),
    new Decimal(0)
  );
  const calculatePercentage = (amount: Decimal) => {
    return amount.div(totalAmount).mul(100).toNumber();
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const percentage = calculatePercentage(new Decimal(item.amount));

        return (
          <div key={index} className="flex items-center">
            <div
              className="w-full h-8 rounded overflow-hidden relative"
              style={{
                color: "rgb(17 24 39)",
              }}
            >
              <div
                className="h-full rounded "
                style={{
                  backgroundColor: "#BFDBFE",
                  width: `${percentage}%`,
                }}
              >
                <div className="flex justify-between absolute left-3 right-3 items-center h-full ">
                  <span className="text-sm  truncate">{item.content}</span>
                  <span className="text-sm  ">
                    {item.amount} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryList;
