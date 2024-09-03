import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { MaterialSymbolsBarChart, MaterialSymbolsLightPieChart } from "./icon";
import { CategoryListData } from "@/api/models/Chart";
import CategoryList from "../CategoryList";
import { CategoryBarChart } from "../PieChart";

interface CategoryChartProps {
  categoryType: string;
  setCategoryType: (type: string) => void;
  categoryData?: CategoryListData[]; // Replace 'any' with the correct type
  colors: string[];
  type: "asset" | "liability" | "expense" | "income";
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categoryType,
  setCategoryType,
  categoryData,
  type,
  colors,
}) => (
  <div className="w-full ">
    <Tabs
      onSelectionChange={(key) => setCategoryType(key as string)}
      selectedKey={categoryType}
      aria-label="Options"
      size="sm"
      radius="sm"
    >
      <Tab
        key="rank"
        title={
          <div className="flex items-center gap-1">
            <MaterialSymbolsBarChart className="text-base rotate-90" />
            <div>排行</div>
          </div>
        }
      />
      <Tab
        key="proportion"
        title={
          <div className="flex items-center gap-1">
            <MaterialSymbolsLightPieChart className="text-base" />
            <div>占比</div>
          </div>
        }
      />
    </Tabs>
    <div className="mt-2">
      {categoryType !== "rank" ? (
        <div className="h-[300px]">
          <CategoryBarChart
            data={
              (categoryData?.map((v, index) => ({
                content: v.content,
                color: colors[index],
                fill: colors[index],
                amount: Number(v.amount) as unknown as string,
              })) as CategoryListData[]) ?? []
            }
          />
        </div>
      ) : (
        <CategoryList type={type} items={categoryData ?? []} />
      )}
    </div>
  </div>
);
