import { describe, expect, it } from 'vitest';

// Test the parseDataUrl logic (extracted for testability)
function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL');
  }
  return { mediaType: match[1], base64: match[2] };
}

function guessMediaType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
  const types: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return types[ext || ''] || 'image/png';
}

describe('parseDataUrl', () => {
  it('parses valid data URL', () => {
    const result = parseDataUrl('data:image/png;base64,iVBORw0KGgo=');
    expect(result.mediaType).toBe('image/png');
    expect(result.base64).toBe('iVBORw0KGgo=');
  });

  it('throws on invalid data URL', () => {
    expect(() => parseDataUrl('https://example.com/image.png')).toThrow(
      'Invalid data URL',
    );
  });
});

describe('guessMediaType', () => {
  it('detects png', () => {
    expect(guessMediaType('https://example.com/image.png')).toBe('image/png');
  });

  it('detects jpeg', () => {
    expect(guessMediaType('https://example.com/photo.jpg')).toBe('image/jpeg');
    expect(guessMediaType('https://example.com/photo.jpeg')).toBe('image/jpeg');
  });

  it('handles query params', () => {
    expect(guessMediaType('https://example.com/image.webp?v=1')).toBe('image/webp');
  });

  it('defaults to png', () => {
    expect(guessMediaType('https://example.com/unknown')).toBe('image/png');
  });
});
