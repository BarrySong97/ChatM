import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { NoramlChartData } from "@/api/hooks/expense";

interface TrendProps {
  data: NoramlChartData[];
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
  const dataMax = Math.max(...props.data.map((i: any) => i.data));
  const dataMin = Math.min(...props.data.map((i: any) => i.data));
  const gradientOffset = () => {
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };
  const off = gradientOffset();
  const data = props.data.map((v: any) => ({
    label: v.label,
    amount: Number(v.amount),
  }));

  return (
    <>
      <ChartContainer config={chartConfig} className="h-full aspect-auto">
        <AreaChart
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
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset={off}
                stopColor={chartConfig.positive.color}
                stopOpacity={1}
              />
              <stop
                offset={off}
                stopColor={chartConfig.negative.color}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
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
          <Area dataKey="amount" type="monotone" fillOpacity={0.4} />
        </AreaChart>
      </ChartContainer>
    </>
  );
}
