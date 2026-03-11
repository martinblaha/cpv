import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'CopyVision',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    permissions: [
      'contextMenus',
      'activeTab',
      'clipboardWrite',
      'storage',
      'notifications',
    ],
    host_permissions: ['https://api.anthropic.com/*', '<all_urls>'],
    commands: {
      transcribe: {
        suggested_key: {
          default: 'Alt+T',
        },
        description: '__MSG_commandTranscribe__',
      },
    },
    browser_specific_settings: {
      gecko: {
        id: 'copyvision@martinblaha',
        strict_min_version: '142.0',
        data_collection_permissions: {
          required: ['none'],
          userActivity: false,
          personalInformation: false,
          financialData: false,
          healthData: false,
          locationData: false,
          browsingActivity: false,
          technicalAndInteraction: false,
        },
      } as Record<string, unknown>,
    },
  },
});
