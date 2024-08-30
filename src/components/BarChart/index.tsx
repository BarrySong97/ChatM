import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { NormalChartData } from "@/api/models/Chart";

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
export type props = {
  chartData: NormalChartData[];
};
export function Barchart({ chartData }: props) {
  const data = chartData.map((item) => ({
    label: item.label,
    amount: Number(item.amount),
  }));
  return (
    <ChartContainer config={chartConfig} className="aspect-auto  h-full ">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{
          top: 12,
          left: 0,
          right: 12,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          vertical={false}
        />
        <YAxis
          tickFormatter={(value) => `${value}`}
          tickLine={false}
          axisLine={false}
          interval={3}
          tickMargin={8}
          minTickGap={32}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              nameKey="views"
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
          }
        />
        <Bar dataKey="amount" fill={chartConfig.desktop.color} />
      </BarChart>
    </ChartContainer>
  );
}
