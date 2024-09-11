import { ModelProvider } from "../types";
import { LobeOpenAICompatibleFactory } from "../utils/openaiCompatibleFactory";

export const LobeMoonshotAI = LobeOpenAICompatibleFactory({
  baseURL: "https://api.moonshot.cn/v1",
  provider: ModelProvider.Moonshot,
});
