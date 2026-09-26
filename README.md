# ♟ Rebel Chess

**Rebel Chess** is a chess variant where moves are chosen randomly from a piece's valid moves. Click a piece and it immediately moves to a random legal destination!

## Game Rules

- **Random Moves**: Click any of your pieces to make it move randomly among its valid moves
- **Win Conditions** (configurable):
  - **Capture Leader**: Win by capturing the opponent's Leader piece (default: King)
  - **Capture All**: Win by capturing all opponent pieces
- **Capture First Mode**: When enabled, pieces must capture if a capture is available
- **Board Sizes**: Play on 8×8, 10×10, or custom board sizes
- **Fairy Pieces**: Includes Alfil (2,2 leaper) and Camel (3,1 leaper) alongside standard pieces

## Play vs AI

- **Bloodthirsty AI**: Prefers captures, picks highest-value captures first
- **Random AI**: Makes completely random moves

## Features

- 🎮 **LocalStorage Persistence**: Games save automatically and restore on refresh
- 📱 **Fully Responsive**: Board scales to fit any screen size
- 🔌 **Offline Support**: Service Worker enables fully offline play
- ⚙️ **Configurable**: Board preset, move mode, victory condition, AI profile

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Settings

| Setting           | Options                          | Default        |
| ----------------- | -------------------------------- | -------------- |
| Board Preset      | Classic 8×8, Large 10×10, Custom | Classic 8×8    |
| Move Mode         | Regular, Capture First           | Regular        |
| Victory Condition | Capture Leader, Capture All      | Capture Leader |
| VS AI             | On/Off                           | Off            |
| AI Profile        | Bloodthirsty, Random             | Bloodthirsty   |

## Building for Production

```bash
npm run build
```

Outputs to `dist/` - deploy this folder to any static host (Netlify, Vercel, GitHub Pages, etc.)

The service worker (`public/sw.js`) enables offline play. Ensure your host serves over HTTPS (required for SW).

## License

MIT

> AI Disclaimer: Created with the help of NVIDIA Nemotron
