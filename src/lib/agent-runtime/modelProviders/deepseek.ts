import { ModelProviderCard } from "../llm";

// ref https://platform.deepseek.com/api-docs/pricing
const DeepSeek: ModelProviderCard = {
  chatModels: [
    {
      description: "擅长通用对话任务",
      displayName: "DeepSeek-V2",
      enabled: true,
      functionCall: true,
      id: "deepseek-chat",
      tokens: 128_000,
    },
    {
      description: "擅长处理编程和数学任务",
      displayName: "DeepSeek-Coder-V2",
      enabled: true,
      functionCall: true,
      id: "deepseek-coder",
      tokens: 128_000,
    },
  ],
  checkModel: "deepseek-chat",
  id: "deepseek",
  modelList: { showModelFetcher: true },
  baseURL: "https://api.deepseek.com/v1",
  defaultModel: "deepseek-chat",
  name: "DeepSeek",
};

export default DeepSeek;
