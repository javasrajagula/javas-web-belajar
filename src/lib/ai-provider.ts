import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function getGeminiApiKey() {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

export function getGeminiModelId() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export function hasAiProvider() {
  return Boolean(process.env.ANTHROPIC_API_KEY || getGeminiApiKey());
}

export function canUseDevelopmentFallback() {
  return process.env.NODE_ENV !== 'production';
}

export function getServerAiModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic('claude-3-5-sonnet-20241022');
  }

  const geminiApiKey = getGeminiApiKey();
  if (geminiApiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });
    return google(getGeminiModelId());
  }

  return null;
}

export const AI_ENV_ERROR =
  'Provider AI belum dikonfigurasi. Set GEMINI_API_KEY atau GOOGLE_GENERATIVE_AI_API_KEY di environment server.';
