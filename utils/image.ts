const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1568;

export interface ImageData {
  base64: string;
  mediaType: string;
}

/**
 * Fetch an image URL and return its base64-encoded data.
 * Runs in the background service worker (CORS-free).
 */
export async function fetchImageAsBase64(url: string): Promise<ImageData> {
  // Handle data: URLs directly
  if (url.startsWith('data:')) {
    return parseDataUrl(url);
  }

  const blob = await xhrFetchBlob(url);
  const mediaType = blob.type || guessMediaType(url);

  if (blob.size > MAX_SIZE_BYTES) {
    return resizeImage(blob, mediaType);
  }

  const base64 = await blobToBase64(blob);
  return { base64, mediaType };
}

/**
 * Fetch a URL as a Blob using XMLHttpRequest.
 * In Firefox MV2, XHR from the background page respects extension
 * host permissions and bypasses CORS restrictions.
 */
function xhrFetchBlob(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
      } else {
        reject(new Error(`Failed to fetch image: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error fetching image'));
    xhr.send();
  });
}

function parseDataUrl(dataUrl: string): ImageData {
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

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Resize an image that exceeds the size limit.
 * Uses OffscreenCanvas (available in service workers).
 */
async function resizeImage(blob: Blob, mediaType: string): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;

  let newWidth = width;
  let newHeight = height;

  const longestSide = Math.max(width, height);
  if (longestSide > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / longestSide;
    newWidth = Math.round(width * scale);
    newHeight = Math.round(height * scale);
  }

  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  const outputType = mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
  const outputBlob = await canvas.convertToBlob({
    type: outputType,
    quality: 0.85,
  });

  const base64 = await blobToBase64(outputBlob);
  return { base64, mediaType: outputType };
}
