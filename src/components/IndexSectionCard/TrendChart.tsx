import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { MaterialSymbolsShowChart, MaterialSymbolsBarChart } from "./icon";
import { Trend } from "../LineChart";
import { CategoryBarChart } from "../PieChart";
import { NormalChartData } from "@/api/models/Chart";
import { Barchart } from "../BarChart";

interface TrendChartProps {
  chartType: string;
  setChartType: (type: string) => void;
  lineData?: NormalChartData[]; // Replace 'any' with the correct type
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  type: "asset" | "expense" | "income" | "liability";
}

export const TrendChart: React.FC<TrendChartProps> = ({
  chartType,
  setChartType,
  lineData,
  title,
  showDefaultTitle = false,
  type,
}) => {
  const sum = lineData?.reduce((acc, cur) => acc + Number(cur.amount), 0);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {showDefaultTitle ? (
          <div className="text-lg font-semibold">金额: {sum?.toFixed(2)}</div>
        ) : null}
        {title ? <div>{title}</div> : null}
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
      </div>
      <div className="h-[300px] 2xl:h-[350px] w-full mt-2">
        {chartType === "line" ? (
          <Trend data={lineData ?? []} type={type} />
        ) : (
          <Barchart type={type} chartData={lineData ?? []} />
        )}
      </div>
    </div>
  );
};
