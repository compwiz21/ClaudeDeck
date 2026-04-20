# ClaudeDeck

Launch and manage multiple Claude Code CLI sessions from your Elgato Stream Deck.

Each button spawns a Claude Code shell in its own Windows Terminal tab — with dynamic status icons, color-coded sessions, and one-press focus switching.

## Actions

| Action | Description |
|--------|-------------|
| **Launch** | Opens a new Windows Terminal tab running `claude` in a configured project directory |
| **Session Tile** | Live status indicator — shows session name + state (idle/active/done/error). Press to focus. |
| **Kill** | Terminates a session (double-press to confirm) |

## Requirements

- Windows 10+
- [Elgato Stream Deck](https://www.elgato.com/stream-deck) with Stream Deck app 7.1+
- [Windows Terminal](https://aka.ms/terminal)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and on PATH
- Node.js 20+ (for development only — plugin bundles its own runtime)

## Development

```bash
npm install
npm run build     # one-time build
npm run watch     # dev mode with auto-rebuild + hot-reload
```

Enable Stream Deck developer mode:
```bash
streamdeck dev
```

## Project Structure

```
src/
  plugin.ts              # Entry point
  actions/
    launch.ts            # Launch Claude session action
    tile.ts              # Session status tile action
    kill.ts              # Kill session action
  services/
    session-manager.ts   # Session lifecycle tracking
    terminal-launcher.ts # Windows Terminal integration
    svg-generator.ts     # Dynamic button icon generation
  types/
    settings.ts          # TypeScript type definitions
com.claudedeck.sdPlugin/
  manifest.json          # Plugin metadata
  ui/                    # Property Inspector HTML
  imgs/                  # Static icons
```

## How It Works

1. **Launch** action runs `wt.exe` to open a new tab in a dedicated "claudedeck" Windows Terminal window
2. A wrapper script tracks when `claude` exits by writing status to a temp file
3. **Session Tile** polls status files and updates its dynamic SVG icon in real time
4. Press a tile to focus the terminal window; double-press **Kill** to remove a session

## License

MIT
