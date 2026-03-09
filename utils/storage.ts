import { storage } from 'wxt/utils/storage';

const apiKeyItem = storage.defineItem<string>('local:apiKey', {
  fallback: '',
});

export async function getApiKey(): Promise<string> {
  return apiKeyItem.getValue();
}

export async function setApiKey(key: string): Promise<void> {
  await apiKeyItem.setValue(key.trim());
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key.length > 0;
}
