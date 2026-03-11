export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Track the element currently under the mouse cursor
    let elementUnderCursor: Element | null = null;

    document.addEventListener(
      'mouseover',
      (e) => {
        elementUnderCursor = e.target as Element;
      },
      { passive: true },
    );

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      // Get image URL under cursor (for Alt+T shortcut)
      if (message.type === 'cpv:get-image-under-cursor') {
        const url = getImageUrl(elementUnderCursor);
        sendResponse({ url });
        return;
      }

      // Write to clipboard (Firefox fallback)
      if (message.type === 'cpv:clipboard') {
        navigator.clipboard.writeText(message.text).then(
          () => sendResponse({ success: true }),
          (err: Error) => sendResponse({ error: err.message }),
        );
        return true; // async response
      }
    });

    /**
     * Extract the image URL from an element.
     * Handles <img>, <picture>, CSS background-image, and <canvas>.
     */
    function getImageUrl(el: Element | null): string | null {
      if (!el) return null;

      // Direct <img> element
      if (el instanceof HTMLImageElement) {
        return el.currentSrc || el.src;
      }

      // <source> inside <picture>
      if (el.closest('picture')) {
        const img = el.closest('picture')?.querySelector('img');
        if (img) return img.currentSrc || img.src;
      }

      // CSS background-image
      const bgImage = getComputedStyle(el).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const match = bgImage.match(/url\(["']?(.+?)["']?\)/);
        if (match) return match[1];
      }

      // <canvas> element
      if (el instanceof HTMLCanvasElement) {
        try {
          return el.toDataURL('image/png');
        } catch {
          return null;
        }
      }

      return null;
    }

  },
});
