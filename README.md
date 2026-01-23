# gotrain 🚂

> Atomic CLI for NYC train departures (MTA Subway, LIRR, Metro-North)

No dependencies. No config. Just trains.

![CI](https://img.shields.io/badge/CI-bash--only-yellow)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ClawdHub Integration

This tool is available as a **ClawdHub skill**! Use it from any chat surface where ClawdHub is connected.

- **Skill**: [`gotrain`](https://clawdhub.com/skills/gotrain) on ClawdHub
- **Docs**: [gotrain Skill](https://docs.clawd.bot/skills/gotrain) in ClawdHub docs

Powered by [ClawdHub](https://clawd.bot) — your personal penguin assistant.

## Install

```bash
# One-liner (macOS/Linux)
curl -sL https://raw.githubusercontent.com/gumadeiras/gotrain-cli/main/install.sh | bash

# Or manually
cp nyc-train ~/.local/bin/gotrain
chmod +x ~/.local/bin/gotrain
```

Requires: `curl`, `jq`

## Usage

```bash
# Search stations
gotrain stations penn       # Search for "penn"
gotrain stations            # List all stations

# Get departures
gotrain departures MNR-149  # New Haven departures
gotrain departures MNR-1    # Grand Central departures

# Service alerts
gotrain alerts              # Active service alerts

# Favorites
gotrain fav MNR-149         # Add/remove station from favorites
gotrain favs                # List favorite stations
```

### Examples

```bash
$ gotrain stations haven
🟥 MNR | New Haven
🟥 MNR | New Haven-State St
🟥 MNR | West Haven

$ gotrain departures MNR-149
🟥 New Haven Departures
========================
15:39 | → Grand Central 🟢
      Track: 19 | On Time
16:24 | → Grand Central 🟢
      Track: - | On Time

$ gotrain alerts
⚠️  Uptown [4][5] trains are running with delays...
   No description....
```

## Commands

| Command | Description |
|---------|-------------|
| `stations [query]` | Search/list stations |
| `departures <id>` | Show departures for station |
| `alerts` | Active service alerts |
| `fav <id>` | Toggle favorite station |
| `favs` | List favorite stations |

## Data Source

Powered by [MetroFlow API](https://metroflow.ainslie.digital) — real-time NYC transit data.

## Why?

Most train apps are bloated. This is one shell script. No Node.js, no Python, no dependencies to break.

## License

MIT 🐧
