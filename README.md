# gotrain 🚂

> Atomic CLI for MTA system train departures (NYC Subway, LIRR, Metro-North)

No dependencies. No config. Just trains.

![CI](https://img.shields.io/badge/CI-bash--only-yellow)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Why?

Most train apps are bloated. This is one shell script.

## Install

**One-liner (macOS/Linux):**
```bash
curl -sL https://raw.githubusercontent.com/gumadeiras/gotrain-cli/main/install.sh | bash
```

## Usage

```bash
# Search stations
gotrain stations penn       # Search for "penn"
gotrain stations            # List all stations

# Departures & Arrivals
gotrain departures MNR-149  # Departures from New Haven
gotrain departures nh --to MNR-1 # Filter departures to Grand Central (using alias)
gotrain arrivals MNR-1      # Arrivals at Grand Central
gotrain arrivals MNR-1 --from nh # Filter arrivals from New Haven

# Service alerts
gotrain alerts              # Active service alerts

# Favorites
gotrain favorite add MNR-149 nh  # Add with alias 'nh'
gotrain favorite rm nh           # Remove by alias
gotrain favs                     # List favorite stations
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
| `departures <id> [--to <id>]` | Show departures (optional destination filter) |
| `arrivals <id> [--from <id>]` | Show arrivals (optional origin filter) |
| `alerts` | Active service alerts |
| `favorite <id\|add\|rm> [alias]` | Add/remove/toggle favorites |
| `favs` | List favorite stations |

## Clawdbot Integration

This tool is available as a **ClawdHub skill**! Use it from any chat where Clawdbot is connected.

- **Skill**: [`gotrain`](https://clawdhub.com/skills/gotrain) on ClawdHub

## Data Source

Powered by [MetroFlow API](https://metroflow.ainslie.digital) — real-time MTA transit data.

## Contributing
 
 PRs are welcome! If you find any bugs or have feature requests, please [open an issue](https://github.com/gumadeiras/gotrain-cli/issues/new).

 - **Development**: Run `./tests/test_gotrain.py` to verify changes locally.
 - **Style**: Keep the script atomic. No external dependencies if possible.

 ## License

MIT 🐧
