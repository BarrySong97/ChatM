export type CategoryListData = {
  content: string;
  color?: string;
  amount: string;
};
export type NormalChartData = {
  amount: string;
  label: string;
};

export type SankeyData = {
  nodes: { name: string }[];
  links: { source: string; target: string; value: number }[];
};
