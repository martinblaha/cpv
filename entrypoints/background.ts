import { transcribeImage } from '@/utils/api';
import { copyToClipboard } from '@/utils/clipboard';
import { fetchImageAsBase64 } from '@/utils/image';
import { hasApiKey } from '@/utils/storage';

export default defineBackground(() => {
  // Create context menu on install
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'cpv-transcribe',
      title: browser.i18n.getMessage('contextMenuTranscribe') || 'CopyVision: Transcribe',
      contexts: ['image'],
    });
  });

  // Handle context menu click
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'cpv-transcribe') return;
    if (!tab?.id) return;

    const srcUrl = info.srcUrl;
    if (!srcUrl) {
      notify('Error', 'No image URL found');
      return;
    }

    await handleTranscription(srcUrl, tab.id);
  });

  // Handle keyboard shortcut
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'transcribe') return;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Ask content script for the image under cursor
    try {
      const response = (await browser.tabs.sendMessage(tab.id, {
        type: 'cpv:get-image-under-cursor',
      })) as { url?: string };

      if (!response?.url) {
        notify('CopyVision', 'No image found under cursor');
        return;
      }

      await handleTranscription(response.url, tab.id);
    } catch {
      notify('CopyVision', 'Could not communicate with page. Try refreshing.');
    }
  });

  // Handle messages from content script
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'cpv:transcribe') {
      handleTranscription(message.url, message.tabId, message.prompt).then(
        () => sendResponse({ success: true }),
        (err: Error) => sendResponse({ error: err.message }),
      );
      return true; // async response
    }
  });

  async function handleTranscription(
    imageUrl: string,
    tabId: number,
    customPrompt?: string,
  ): Promise<void> {
    if (!(await hasApiKey())) {
      notify('CopyVision', 'API key not set. Click the extension icon to configure.');
      return;
    }

    // Show loading notification
    notify('CopyVision', 'Transcribing image...');

    try {
      const { base64, mediaType } = await fetchImageAsBase64(imageUrl);
      const { text } = await transcribeImage(base64, mediaType, customPrompt);
      await copyToClipboard(text, tabId);
      notify('CopyVision', 'Text copied to clipboard!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      notify('CopyVision', `Error: ${message}`);
    }
  }

  function notify(title: string, message: string): void {
    browser.notifications?.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title,
      message,
    });
  }
});
