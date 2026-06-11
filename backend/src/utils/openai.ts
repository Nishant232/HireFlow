import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY environment variable is required. ' +
    'Get your free key at https://openrouter.ai/keys'
  );
}

// OpenRouter is fully OpenAI-compatible — only baseURL and apiKey differ
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    // Required by OpenRouter — identifies your app in their dashboard
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
    'X-Title': 'JobTrackr',
  },
});

// ---------------------------------------------------------------------------
// Model used for all AI features
// Paid model via OpenRouter — no ":free" suffix
// ---------------------------------------------------------------------------
const MODEL = 'meta-llama/llama-3.1-8b-instruct';

export const FREE_MODELS = {
  primary:   MODEL,
  fast:      MODEL,
  reasoning: MODEL,
  documents: MODEL,
};

// ---------------------------------------------------------------------------
// Robust JSON extractor — handles all common LLM wrapping patterns:
//   • Plain JSON
//   • ```json ... ```
//   • ``` ... ```
//   • Preamble text before the first { or [
// ---------------------------------------------------------------------------
export function extractJSON(raw: string): string {
  // 1. Strip markdown code fences (with or without language hint)
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  // 2. Find the first { or [ and the last matching } or ]
  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');

  let start = -1;
  let endChar = '';

  if (firstObj === -1 && firstArr === -1) {
    throw new Error(`No JSON found in AI response. Raw: ${raw.substring(0, 200)}`);
  } else if (firstObj === -1) {
    start = firstArr;
    endChar = ']';
  } else if (firstArr === -1) {
    start = firstObj;
    endChar = '}';
  } else {
    // Whichever appears first is the start of the JSON
    if (firstObj < firstArr) {
      start = firstObj;
      endChar = '}';
    } else {
      start = firstArr;
      endChar = ']';
    }
  }

  const end = text.lastIndexOf(endChar);
  if (end === -1 || end <= start) {
    throw new Error(`Malformed JSON in AI response. Raw: ${raw.substring(0, 200)}`);
  }

  return text.substring(start, end + 1);
}

// ---------------------------------------------------------------------------
// Core chat completion helper — model-aware, with full error handling
// ---------------------------------------------------------------------------
export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1000,
  model: string = FREE_MODELS.primary
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from model');
    }

    return content;
  } catch (error: any) {
    // Re-throw our own errors (e.g. from extractJSON) without wrapping
    if (error?.message?.startsWith('No JSON') || error?.message?.startsWith('Malformed JSON')) {
      throw error;
    }
    // Handle OpenRouter-specific rate limit error
    if (error?.status === 429) {
      throw new Error(
        'AI rate limit reached. Free tier allows 20 requests/minute. ' +
        'Please wait a moment and try again.'
      );
    }
    // Log the full error for debugging, then throw a clean user-facing message
    console.error(`OpenRouter API error [model=${model}]:`, error?.message || error);
    throw new Error(`AI request failed (${error?.status || 'unknown'}): ${error?.message || 'Please try again.'}`);
  }
}