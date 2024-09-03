import { CategoryListData } from "@/api/models/Chart";
import { EChart } from "@kbox-labs/react-echarts";

export const description = "A pie chart with a label";

export function CategoryBarChart({
  data,
}: {
  data: CategoryListData[]; // Replace 'any' with the correct type
}) {
  return (
    <EChart
      style={{
        height: "100%",
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
          data: data?.map((item) => ({
            value: Number(item.amount),
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
  );
}
