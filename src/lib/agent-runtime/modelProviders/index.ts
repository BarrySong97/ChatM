import { ChatModelCard, ModelProviderCard } from "../llm";

import AnthropicProvider from "./anthropic";
import DeepSeekProvider from "./deepseek";
import MoonshotProvider from "./moonshot";
import OpenAIProvider from "./openai";
import ZhiPuProvider from "./zhipu";

export const LOBE_DEFAULT_MODEL_LIST: ChatModelCard[] = [
  OpenAIProvider.chatModels,
  ZhiPuProvider.chatModels,
  DeepSeekProvider.chatModels,
  MoonshotProvider.chatModels,
  AnthropicProvider.chatModels,
].flat();

export const DEFAULT_MODEL_PROVIDER_LIST = [
  OpenAIProvider,
  AnthropicProvider,
  DeepSeekProvider,
  MoonshotProvider,
  ZhiPuProvider,
];

export const filterEnabledModels = (provider: ModelProviderCard) => {
  return provider.chatModels.filter((v) => v.enabled).map((m) => m.id);
};

export const isProviderDisableBroswerRequest = (id: string) => {
  const provider = DEFAULT_MODEL_PROVIDER_LIST.find(
    (v) => v.id === id && v.disableBrowserRequest
  );
  return !!provider;
};

export { default as AnthropicProviderCard } from "./anthropic";
export { default as DeepSeekProviderCard } from "./deepseek";
export { default as MoonshotProviderCard } from "./moonshot";
export { default as OpenAIProviderCard } from "./openai";
export { default as ZhiPuProviderCard } from "./zhipu";
