import "server-only";

import OpenAI from "openai";

import { getServerEnv } from "@/lib/env.server";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: getServerEnv().OPENAI_API_KEY });
  }

  return openai;
}

export async function createTextEmbedding(input: string) {
  const env = getServerEnv();
  const response = await getOpenAIClient().embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}
