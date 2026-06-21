import "server-only";

import OpenAI from "openai";

import { getOpenAIEnv } from "@/lib/env.server";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: getOpenAIEnv().OPENAI_API_KEY });
  }

  return openai;
}

export async function createTextEmbedding(input: string) {
  const env = getOpenAIEnv();
  const response = await getOpenAIClient().embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}
