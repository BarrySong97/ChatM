import { ModuleType } from "@/constant";

export type Setting = {
  general: General;
};
export type General = {
  chatbot: ChatBots;
  module: {
    module1: boolean;
    module2: boolean;
    module3: boolean;
    module4: boolean;
  };
};
export type ChatBots = {
  [ModuleType.TITLE_ABSTRACT_SCREENING]: boolean;
  [ModuleType.DATA_EXTRACTION]: boolean;
};
