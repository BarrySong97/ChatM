import React from "react";
import { Empty } from "antd";
import { EChart } from "@kbox-labs/react-echarts";

interface SankeyNode {
  name: string;
  type: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  flow: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyChartProps {
  sankeyData: SankeyData | undefined;
}

export const typeColorMap = {
  asset: "#AAD8D2",
  liability: "#F6E7C3",
  income: "#BFDCFD",
  expense: "#F3A5B6",
  assets: "#AAD8D2",
};
const SankeyChart: React.FC<SankeyChartProps> = ({ sankeyData }) => {
  if (!sankeyData?.nodes.length || !sankeyData?.links.length) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Empty />
      </div>
    );
  }
  return (
    <EChart
      style={{
        height: "300px",
        width: "100%",
      }}
      tooltip={{
        trigger: "item",
        triggerOn: "mousemove",
      }}
      series={[
        {
          type: "sankey",
          emphasis: {
            focus: "adjacency",
          },
          data:
            sankeyData?.nodes?.map((v) => {
              return {
                ...v,
                itemStyle: {
                  // color: "#E4E4E5",
                  // borderColor: "#E4E4E5",
                  borderColor:
                    typeColorMap[v.type as keyof typeof typeColorMap],
                  color: typeColorMap[v.type as keyof typeof typeColorMap],
                },
              };
            }) ?? [],
          links:
            sankeyData?.links?.map((v) => {
              return {
                ...v,
                lineStyle: {
                  color: v.flow !== "in" ? "#F3A5B6" : "#BFDCFD",
                },
              };
            }) ?? [],
          lineStyle: {
            color: "#F3A5B6",
            curveness: 0.5,
          },

          itemStyle: {
            color: "#1f77b4",
            borderColor: "#1f77b4",
          },
          label: {
            color: "rgba(0,0,0,0.7)",
            fontFamily: "Arial",
            fontSize: 16,
          },
        },
      ]}
    />
  );
};

export default SankeyChart;
