import { EChart } from "@kbox-labs/react-echarts";

import { CategoryListData } from "@/api/models/Chart";

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
      series={{
        type: "pie",
        radius: "50%",
        avoidLabelOverlap: false,
        data: data.map((item) => ({
          value: Number(item.amount),
          name: item.content,
        })),
        labelLine: {
          show: true,
        },
        emphasis: {
          label: {
            show: true,
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },

        label: {
          show: false,
          position: "center",
        },
      }}
    />
  );
}
