import { ModelProvider } from "../types";
import { LobeOpenAICompatibleFactory } from "../utils/openaiCompatibleFactory";

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: "https://api.openai.com/v1",
  provider: ModelProvider.OpenAI,
});
