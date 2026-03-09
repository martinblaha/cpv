/**
 * Copy text to clipboard via the content script.
 * Service workers don't have DOM access, so we delegate to the content script.
 */
export async function copyToClipboard(text: string, tabId: number): Promise<void> {
  await browser.tabs.sendMessage(tabId, {
    type: 'cpv:clipboard',
    text,
  });
}
