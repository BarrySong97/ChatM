export type CategoryListData = {
  content: string;
  color?: string;
  amount: string;
};
export type NormalChartData = {
  amount: string;
  label: string;
};
export type Link = {
  source: string;
  target: string;
  value: number;
  flow: "in" | "out";
};
export type SankeyNode = {
  name: string;
  type: string;
};
export type SankeyData = {
  nodes: SankeyNode[];
  links: Link[];
};
