import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_AI_TIMEOUT_MS = 40_000;
const DEFAULT_AI_RETRY_ATTEMPTS = 2;

export function getGeminiApiKey() {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

export function getGeminiModelId() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export function getAiTimeoutMs() {
  const configured = Number(process.env.AI_REQUEST_TIMEOUT_MS);
  return Number.isFinite(configured) && configured >= 5_000 ? configured : DEFAULT_AI_TIMEOUT_MS;
}

export function hasAiProvider() {
  return Boolean(process.env.ANTHROPIC_API_KEY || getGeminiApiKey());
}

export function canUseDevelopmentFallback() {
  return process.env.NODE_ENV !== 'production';
}

export function getServerAiModel() {
  const geminiApiKey = getGeminiApiKey();
  if (geminiApiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });
    return google(getGeminiModelId());
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic('claude-3-5-sonnet-20241022');
  }

  return null;
}

export function getServerAiProviderStatus() {
  return {
    hasGeminiApiKey: Boolean(getGeminiApiKey()),
    geminiModel: getGeminiModelId(),
    hasAnthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    preferredProvider: getGeminiApiKey() ? 'gemini' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none',
  };
}

export async function runAiWithRetry<T>(
  operation: () => Promise<T>,
  options: { attempts?: number; timeoutMs?: number; label?: string } = {}
) {
  const attempts = Math.max(1, options.attempts || DEFAULT_AI_RETRY_ATTEMPTS);
  const timeoutMs = options.timeoutMs || getAiTimeoutMs();
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            reject(new Error(`${options.label || 'AI request'} timeout setelah ${timeoutMs}ms`));
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
}

export const AI_ENV_ERROR =
  'Provider AI belum dikonfigurasi. Set GEMINI_API_KEY atau GOOGLE_GENERATIVE_AI_API_KEY di environment server.';
