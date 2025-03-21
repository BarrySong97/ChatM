import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { NormalChartData } from "@/api/models/Chart";
import dayjs from "dayjs";
import { zhMap } from "../LineChart";

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
  type: string;
};
export function Barchart({ chartData, type }: props) {
  const title = zhMap[type as keyof typeof zhMap];
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
            return dayjs(date).format("YYYY-MM-DD");
          }}
        />
        <ChartTooltip
          content={(props) => {
            if (props.payload && props.payload.length > 0) {
              const data = props.payload[0].payload;
              return (
                <div className="bg-white p-2  rounded shadow flex gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1 h-full rounded-md"
                      style={{
                        backgroundColor: `hsl(var(--chart-${type}))`,
                      }}
                    ></div>
                  </div>
                  <div>
                    <p>{`日期: ${props.label}`}</p>
                    <p>{`${title}: ${data.amount.toFixed(2)}`}</p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="amount" fill={`hsl(var(--chart-${type}))`} />
      </BarChart>
    </ChartContainer>
  );
}
