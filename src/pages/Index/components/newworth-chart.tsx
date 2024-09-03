import { Area, AreaChart, XAxis, ResponsiveContainer } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  assets: {
    color: "hsl(var(--chart-asset))",
  },
  liability: {
    color: "hsl(var(--chart-liability))",
  },
  income: {
    color: "hsl(var(--chart-income))",
  },
  expense: {
    color: "hsl(var(--chart-expense))",
  },
} satisfies ChartConfig;

interface TrendProps {
  data: {
    label: string;
    data: number;
  }[];
}

export default function NewworthChart({ data }: TrendProps) {
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.data));
    const dataMin = Math.min(...data.map((i) => i.data));

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
    <div className="flex-1 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={[
              {
                label: "",
                data: 0,
              },
              ...data,
            ]}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              allowDataOverflow
              interval={data.length - 1}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.assets.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.assets.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="data"
              type="monotone"
              fill="url(#fillDesktop)"
              stroke={chartConfig.assets.color}
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
