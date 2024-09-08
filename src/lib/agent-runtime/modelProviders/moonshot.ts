import { ModelProviderCard } from "../llm";

// ref https://platform.moonshot.cn/docs/intro#模型列表
const Moonshot: ModelProviderCard = {
  chatModels: [
    {
      displayName: "Moonshot V1 128K",
      enabled: true,
      functionCall: true,
      id: "moonshot-v1-128k",
      tokens: 128_000,
    },
    {
      displayName: "Moonshot V1 32K",
      enabled: true,
      functionCall: true,
      id: "moonshot-v1-32k",
      tokens: 32_768,
    },
    {
      displayName: "Moonshot V1 8K",
      enabled: true,
      functionCall: true,
      id: "moonshot-v1-8k",
      tokens: 8192,
    },
  ],
  checkModel: "moonshot-v1-8k",
  baseURL: "https://api.moonshot.cn/v1",
  id: "moonshot",
  name: "Moonshot",
  defaultModel: "moonshot-v1-8k",
};

export default Moonshot;
