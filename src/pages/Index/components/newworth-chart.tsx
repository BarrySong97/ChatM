import { Area, AreaChart, XAxis, ResponsiveContainer } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import dayjs from "dayjs";

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
    <div className="flex-1 mt-2 ">
      <ChartContainer config={chartConfig} className="h-[80px] w-full">
        <AreaChart
          accessibilityLayer
          data={
            data.length === 0
              ? []
              : [
                  {
                    label: "",
                    data: 0,
                  },
                  ...data,
                ]
          }
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            allowDataOverflow
            tickMargin={10}
            // minTickGap={32}
            ticks={[data?.[data.length - 1]?.label ?? ""]}
            tickFormatter={(value) => {
              return dayjs(value).format("YYYY-MM-DD");
            }}
          />
          <ChartTooltip
            cursor={false}
            content={(props) => {
              if (props.payload && props.payload.length > 0) {
                const data = props.payload[0].payload;
                return (
                  <div className="bg-white p-2  rounded shadow flex gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1 h-full rounded-md"
                        style={{
                          backgroundColor: `hsl(var(--chart-asset))`,
                        }}
                      ></div>
                    </div>
                    <div>
                      <p>{`日期: ${props.label}`}</p>
                      <p>{`净资产: ${data.data.toFixed(2)}`}</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
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
    </div>
  );
}
