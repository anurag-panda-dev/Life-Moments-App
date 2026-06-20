# Life Moments

A simple Expo React Native app for capturing and saving photo moments with optional location watermarking.

## Features
- Camera capture
- Location-aware photo saving
- Photo gallery browsing
- Expo Router-based navigation

## Getting Started

### Install dependencies
```bash
pnpm install
```

### Run locally
```bash
pnpm exec expo start
```

### Build for production
```bash
pnpm run build
```

### Serve exported app
```bash
pnpm run serve
```

## Project structure
- `app/` - Expo Router screens and layout
- `components/` - Reusable UI components
- `constants/` - Color and theme values
- `context/` - App state providers
- `hooks/` - Custom hooks
- `assets/` - Images and static assets
- `scripts/` - Custom build scripts
- `server/` - Local serve script

## Notes
- Uses Expo SDK 54
- Includes camera, location, and media library permissions
- Built with TypeScript and React Native
