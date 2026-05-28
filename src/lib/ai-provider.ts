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
      if (isAiQuotaError(error)) {
        throw error;
      }
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
}

export function isAiQuotaError(error: unknown) {
  const details = collectAiErrorDetails(error);
  return details.some((detail) =>
    detail.statusCode === 429 ||
    /RESOURCE_EXHAUSTED|quota exceeded|rate limit|too many requests/i.test(detail.message)
  );
}

export function getAiProviderUserMessage(error: unknown) {
  if (isAiQuotaError(error)) {
    return 'Kuota Gemini untuk server sedang habis atau terkena rate limit. API key sudah terbaca, tetapi provider menolak request sementara. Coba lagi beberapa menit kemudian, ganti GEMINI_MODEL ke model yang kuotanya masih tersedia, atau aktifkan billing/kuota tambahan di Google AI Studio.';
  }

  const details = collectAiErrorDetails(error);
  if (details.some((detail) => detail.statusCode === 401 || detail.statusCode === 403 || /API key|permission|auth/i.test(detail.message))) {
    return 'Gemini menolak request karena konfigurasi API key atau izin belum valid. Periksa GEMINI_API_KEY di environment server/Vercel.';
  }

  return 'Provider AI gagal menjawab. Konfigurasi Gemini terbaca, tetapi request gagal diproses oleh provider.';
}

function collectAiErrorDetails(error: unknown): Array<{ statusCode?: number; message: string }> {
  const seen = new Set<unknown>();
  const details: Array<{ statusCode?: number; message: string }> = [];

  const visit = (value: unknown) => {
    if (!value || seen.has(value)) return;
    seen.add(value);

    if (typeof value === 'string') {
      details.push({ message: value });
      return;
    }

    if (value instanceof Error) {
      const anyError = value as Error & {
        statusCode?: number;
        responseBody?: string;
        lastError?: unknown;
        errors?: unknown[];
      };
      details.push({
        statusCode: anyError.statusCode,
        message: `${anyError.message || ''}\n${anyError.responseBody || ''}`.trim(),
      });
      visit(anyError.lastError);
      anyError.errors?.forEach(visit);
    }
  };

  visit(error);
  return details.length ? details : [{ message: 'Unknown AI provider error' }];
}

export const AI_ENV_ERROR =
  'Provider AI belum dikonfigurasi. Set GEMINI_API_KEY atau GOOGLE_GENERATIVE_AI_API_KEY di environment server.';
