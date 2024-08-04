export type Project = {
  id: number;
  title: string;
  date: string; // 更新时间
  modules: Module[]; // 四个模块id
};
export type Module = {
  module: number; // 1,2,3,4
  chatbot_on: boolean;
};
export type Projects = Project[];
