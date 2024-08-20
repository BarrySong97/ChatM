"use client";
import { CategoryData } from "@/api/hooks/expense";
import { EChart } from "@kbox-labs/react-echarts";
export type CategoryProps = {
  data: CategoryData[];
};
const RADIAN = Math.PI / 180;
export function Category({ data }: CategoryProps) {
  return (
    <div className="h-full">
      <EChart
        style={{
          height: "280px",
          width: "100%",
        }}
        tooltip={{
          trigger: "item",
        }}
        series={[
          {
            name: "分类",
            type: "pie",
            radius: "50%",
            data: data.map((item) => ({
              value: item.amount,
              name: item.content,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ]}
      />
      {/* <ChartContainer config={chartConfig} className=" h-full w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            labelLine={false}
            data={data}
            label={renderCustomizedLabel}
            dataKey="amount"
            fontSize={4}
            nameKey="content"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer> */}
    </div>
  );
}
