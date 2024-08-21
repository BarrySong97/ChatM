import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

interface TrendProps {
  data: any;
}
const chartConfig = {
  negative: {
    label: "negative",
    color: "hsl(var(--chart-1))",
  },
  positive: {
    label: "positive",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
export function Trend(props: TrendProps) {
  const gradientOffset = () => {
    const dataMax = Math.max(...props.data.map((i: any) => i.data));
    const dataMin = Math.min(...props.data.map((i: any) => i.data));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };
  const off = gradientOffset();
  return (
    <ChartContainer config={chartConfig} className="h-full aspect-auto">
      <AreaChart
        accessibilityLayer
        data={props.data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={off}
              stopColor={chartConfig.negative.color}
              stopOpacity={1}
            />
            <stop
              offset={off}
              stopColor={chartConfig.positive.color}
              stopOpacity={1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="amount"
          type="monotone"
          fill="url(#splitColor)"
          fillOpacity={0.4}
          stroke="url(#splitColor)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
