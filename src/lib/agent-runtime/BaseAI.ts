import OpenAI from "openai";

import { TextToImagePayload } from "./textToImage";
import { ChatModelCard } from "./llm";

import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  EmbeddingItem,
  EmbeddingsOptions,
  EmbeddingsPayload,
} from "./types";

export interface LobeRuntimeAI {
  baseURL?: string;
  chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): any;

  models?(): Promise<any>;
}

export abstract class LobeOpenAICompatibleRuntime {
  abstract baseURL: string;
  abstract client: OpenAI;

  abstract chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions
  ): Promise<Response>;

  abstract models(): Promise<ChatModelCard[]>;

  abstract embeddings(
    payload: EmbeddingsPayload,
    options?: EmbeddingsOptions
  ): Promise<EmbeddingItem[]>;
}
