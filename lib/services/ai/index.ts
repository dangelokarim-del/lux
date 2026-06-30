import "server-only";

/**
 * Server-side extractor selector. Returns the real OpenAI extractor when a key
 * is configured, otherwise the deterministic mock (so the pipeline still works
 * end-to-end without OpenAI — the one place we keep a fallback, by necessity).
 */
import { hasOpenAi } from "@/lib/config";
import { MockExtractor, type AiExtractor } from "./extractor";
import { OpenAiExtractor } from "./openai-extractor";

let cached: AiExtractor | null = null;

export function getExtractor(): AiExtractor {
  if (cached) return cached;
  cached = hasOpenAi() ? new OpenAiExtractor() : new MockExtractor(0);
  return cached;
}
