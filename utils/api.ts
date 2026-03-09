import { getApiKey } from './storage';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;

const DEFAULT_PROMPT =
  'Transcribe all text visible in this image. Preserve the original formatting, layout, and language as closely as possible. Output only the transcribed text, nothing else.';

export interface TranscribeResult {
  text: string;
}

export interface TranscribeError {
  message: string;
}

export async function transcribeImage(
  base64Data: string,
  mediaType: string,
  customPrompt?: string,
): Promise<TranscribeResult> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured. Click the CopyVision icon to set it.');
  }

  const prompt = customPrompt?.trim() || DEFAULT_PROMPT;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg =
      body?.error?.message || `API request failed with status ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.content
    ?.filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n');

  if (!text) {
    throw new Error('No text returned from API');
  }

  return { text };
}
