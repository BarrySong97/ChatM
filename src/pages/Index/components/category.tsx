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

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function Category() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical">
        <YAxis
          dataKey="browser"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          hide
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label
          }
        />
        <XAxis dataKey="visitors" type="number" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="visitors" layout="vertical" radius={5}>
          <LabelList
            dataKey="browser"
            formatter={(value) =>
              chartConfig[value as keyof typeof chartConfig]?.label
            }
            position="insideLeft"
            offset={8}
            className="fill-[#fff]"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export default StockItem;
