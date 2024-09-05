import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import {
  MaterialSymbolsShowChart,
  MaterialSymbolsBarChart,
  CarbonSankeyDiagram,
} from "./icon";
import { Trend } from "../LineChart";
import { NormalChartData, SankeyData } from "@/api/models/Chart";
import { Barchart } from "../BarChart";
import { useAssetSankeyService } from "@/api/hooks/assets";
import SankeyChart from "../SankyChart";
export interface ChartTabPlaceHolder {
  name: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}
interface TrendChartProps {
  chartType: string;
  setChartType: (type: string) => void;
  lineData?: NormalChartData[]; // Replace 'any' with the correct type
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  type: "asset" | "expense" | "income" | "liability";
  accountId?: string;
  showSankey?: boolean;

  chartTabPlaceHolder?: ChartTabPlaceHolder[];
  sankeyData?: SankeyData;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  chartType,
  setChartType,
  lineData,
  title,
  showDefaultTitle = false,
  type,
  chartTabPlaceHolder,
  accountId,
  showSankey = false,
  sankeyData,
}) => {
  const sum = lineData?.reduce((acc, cur) => acc + Number(cur.amount), 0);

  const renderDefaultTitle = () => {
    if (chartType === "sankey") {
      return <div></div>;
    }
    switch (type) {
      case "income":
        return (
          <div className="text-lg font-semibold">
            该时间段 收入: {sum?.toFixed(2)}
          </div>
        );
      case "expense":
        return (
          <div className="text-lg font-semibold">
            该时间段 支出: {sum?.toFixed(2)}
          </div>
        );
      case "asset":
        return (
          <div className="text-lg font-semibold">
            目前资产: {lineData?.[lineData.length - 1]?.amount}
          </div>
        );
      case "liability":
        return (
          <div className="text-lg font-semibold">
            目前负债: {lineData?.[lineData.length - 1]?.amount}
          </div>
        );
    }
  };
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Trend data={lineData ?? []} type={type} />;
      case "bar":
        return <Barchart type={type} chartData={lineData ?? []} />;
      case "sankey":
        return <SankeyChart sankeyData={sankeyData} />;
      default:
        const chart = chartTabPlaceHolder?.find(
          (item) => item.name === chartType
        );
        return chart?.content;
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {showDefaultTitle ? renderDefaultTitle() : null}
        {title ? <div>{title}</div> : null}
        <Tabs
          onSelectionChange={(key) => setChartType(key as string)}
          selectedKey={chartType}
          aria-label="Options"
          size="sm"
          radius="sm"
        >
          {chartTabPlaceHolder?.map((item) => {
            return (
              <Tab
                key={item.name}
                title={
                  <div className="flex items-center gap-1">
                    {item.icon}
                    <div>{item.name}</div>
                  </div>
                }
              />
            );
          })}
          {showSankey ? (
            <Tab
              key="sankey"
              title={
                <div className="flex items-center gap-1">
                  <CarbonSankeyDiagram className="text-base" />
                  <div>流向图</div>
                </div>
              }
            />
          ) : null}
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
      <div className="h-[300px] 2xl:h-[350px] w-full mt-2">{renderChart()}</div>
    </div>
  );
};
