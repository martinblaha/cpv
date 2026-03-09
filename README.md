# CopyVision (cpv)

Browser extension (Chrome + Firefox) to transcribe text from images via right-click using Claude Vision API. The transcribed text is copied to your clipboard.

## Features

- Right-click any image → "CopyVision: Transcribe"
- Alt+T keyboard shortcut while hovering an image
- Works with regular images, cross-origin, CSS backgrounds, data URLs, and canvas elements
- Automatic image resizing for large files (>5MB)
- Chrome and Firefox support

## Installation

### From Source

```bash
pnpm install
pnpm dev          # Chrome development
pnpm dev:firefox  # Firefox development
```

### Building

```bash
pnpm build        # Chrome production build
pnpm build:firefox
pnpm zip          # Chrome store ZIP
pnpm zip:firefox  # Firefox store ZIP
```

## Setup

1. Install the extension
2. Click the CopyVision icon in your browser toolbar
3. Enter your [Anthropic API key](https://console.anthropic.com/settings/keys)
4. Right-click any image and select "CopyVision: Transcribe"

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm format
```

## License

MIT
