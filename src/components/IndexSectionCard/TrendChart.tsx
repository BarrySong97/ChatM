import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { MaterialSymbolsShowChart, MaterialSymbolsBarChart } from "./icon";
import { Trend } from "../LineChart";
import { CategoryBarChart } from "../BarChart";
import { NormalChartData } from "@/api/models/Chart";

interface TrendChartProps {
  chartType: string;
  setChartType: (type: string) => void;
  lineData?: NormalChartData[]; // Replace 'any' with the correct type
}

export const TrendChart: React.FC<TrendChartProps> = ({
  chartType,
  setChartType,
  lineData,
}) => (
  <>
    <Tabs
      onSelectionChange={(key) => setChartType(key as string)}
      selectedKey={chartType}
      aria-label="Options"
      size="sm"
      radius="sm"
    >
      <Tab
        key="line"
        title={
          <div className="flex items-center gap-1">
            <MaterialSymbolsShowChart className="text-base" />
            <div>折线图</div>
          </div>
        }
      />
      <Tab
        key="bar"
        title={
          <div className="flex items-center gap-1">
            <MaterialSymbolsBarChart className="text-base rotate-90" />
            <div>柱状图</div>
          </div>
        }
      />
    </Tabs>
    <div className="h-[300px] w-full">
      {chartType === "line" ? (
        <Trend data={lineData ?? []} />
      ) : (
        <CategoryBarChart data={lineData ?? []} />
      )}
    </div>
  </>
);
