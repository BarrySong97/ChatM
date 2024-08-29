import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { MaterialSymbolsBarChart, MaterialSymbolsLightPieChart } from "./icon";
import { CategoryListData } from "@/api/models/Chart";
import CategoryList from "../CategoryList";
import { CategoryBarChart } from "../BarChart";

interface CategoryChartProps {
  categoryType: string;
  setCategoryType: (type: string) => void;
  categoryData?: CategoryListData[]; // Replace 'any' with the correct type
  colors: string[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categoryType,
  setCategoryType,
  categoryData,
  colors,
}) => (
  <>
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
    {categoryType !== "rank" ? (
      <div className="h-[280px]">
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
      <CategoryList items={categoryData ?? []} />
    )}
  </>
);
