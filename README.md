# Free API MCP Server

[![GitHub Stars](https://img.shields.io/github/stars/Stevechaapps/free-api-mcp?style=flat-square&logo=github)](https://github.com/Stevechaapps/free-api-mcp/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![CI](https://github.com/Stevechaapps/free-api-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Stevechaapps/free-api-mcp/actions/workflows/ci.yml)
[![MCP](https://img.shields.io/badge/MCP-server-purple?style=flat-square)](https://modelcontextprotocol.io)

**305 free APIs, zero authentication, now accessible to any AI agent.**

Weather forecasts, currency exchange rates, crypto prices, government data, AI/ML models, jokes, geocoding, news, sports — every API in this collection works without API keys, tokens, or signups. This MCP server makes them all available to Claude, Cursor, VS Code, ChatGPT, and any other MCP-compatible AI tool.

---

## Quick Start

### One-shot: tell your coding agent

Copy-paste this to any coding agent (opencode, Claude Code, Cursor, etc.):

> Install the free-api-mcp server from https://github.com/Stevechaapps/free-api-mcp. Clone the repo, run `npm install`, then register it as an MCP server using a local node process pointing at index.js.

The agent will handle the rest — clone, install, and configure itself.

### npx (from GitHub)

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "free-api": {
      "command": "npx",
      "args": ["-y", "github:Stevechaapps/free-api-mcp"]
    }
  }
}
```

Restart Claude Desktop and the tools are available immediately.

### Docker

```bash
docker build -t free-api-mcp .
docker run --rm -i free-api-mcp
```

For use with Claude Desktop:

```json
{
  "mcpServers": {
    "free-api": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "free-api-mcp"]
    }
  }
}
```

### Cursor

```
Cursor → Settings → Features → MCP Servers → Add New
Name: free-api
Type: command
Command: npx -y github:Stevechaapps/free-api-mcp
```

### Claude Code

```bash
claude mcp add free-api npx -y github:Stevechaapps/free-api-mcp
```

### Opencode

Add to your `opencode.json` or `opencode.jsonc`:
```json
{
  "mcp": {
    "free-api": {
      "type": "local",
      "command": ["npx", "-y", "github:Stevechaapps/free-api-mcp"],
      "enabled": true
    }
  }
}
```

For a local install (more reliable on Windows):
```bash
git clone https://github.com/Stevechaapps/free-api-mcp.git
cd free-api-mcp
npm install
```

Then in your opencode config:
```json
{
  "mcp": {
    "free-api": {
      "type": "local",
      "command": ["node", "/absolute/path/to/free-api-mcp/index.js"],
      "enabled": true
    }
  }
}
```

### VS Code + Continue


```json
// .vscode/mcp.json or continue config
{
  "mcpServers": {
    "free-api": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:Stevechaapps/free-api-mcp"]
    }
  }
}
```

---

## Why coding agents need this

Without MCP tools, a coding agent (like Claude in opencode, Cursor, or VS Code) can only **guess or hallucinate API responses**. It might write code that looks right but uses the wrong field names, the wrong endpoint, or made-up response shapes — leaving you to debug.

With this MCP server, the agent **calls the actual API in real time** and builds code from the real response. Here's what changes:

| Before (no MCP) | After (with free-api-mcp) |
|---|---|
| "Build a weather dashboard" → writes code guessing the JSON shape, probably wrong | "Build a weather dashboard" → fetches live weather, sees the exact fields, writes working code in one shot |
| "Create a currency converter" → uses some remembered exchange rate, not the current one | "Create a currency converter" → grabs live EUR/USD from Frankfurter, the code works with today's data |
| "Find an API for X" → might hallucinate a URL that doesn't exist | "Find an API for X" → searches 305 verified APIs, gets the real URL and example |
| Response types are guessed → TypeScript types don't match | Response is inspected live → types, interfaces, and parsing all match reality |

**Concrete workflow examples:**

> **"Fetch all countries from REST Countries and build a country selector dropdown"**
> Agent calls `free_api_call` → sees the JSON structure → writes the correct TypeScript interface and maps the fields. No docs lookup needed.

> **"Get current Bitcoin price and build a price ticker component"**
> Agent calls CoinGecko → gets `{ bitcoin: { usd: 45678 } }` → writes the component using the exact key. The displayed price is real, not a placeholder.

> **"Search for space-related APIs, then build an app that shows the ISS location"**
> Agent calls `search_free_apis("space")` → finds NASA and Launch Library APIs → tests the call → writes working code end-to-end.

In short: the agent becomes a **live-data-powered engineer** instead of a hallucination machine. You get code that works the first time.

---

### `search_free_apis`

Search across 305 free APIs by keyword or category.

Parameters:
| Field | Type | Description |
|---|---|---|
| `query` | string | Search keyword (e.g. "weather", "crypto", "joke") |
| `category` | string | Filter by category |

Categories: ai, animals, data, development, education, entertainment, environment, finance, food, fun, geocoding, government, health, media, music, news, science, security, sports, transportation, utility, weather

### `free_api_call`

Call any of the 305 APIs with custom parameters.

Parameters:
| Field | Type | Description |
|---|---|---|
| `api_name` | string (required) | Exact name of the API to call |
| `params` | object | Query parameters as key-value pairs |

---

## Example Prompts

Try these in Claude Desktop after adding the server:

- "What's the current temperature in Berlin?"
- "How much is 100 USD in Japanese Yen?"
- "Tell me a programming joke"
- "Show me data about Germany from Rest Countries"
- "What's the latest Bitcoin price from CoinGecko?"
- "Find me APIs related to space exploration"
- "Get the exchange rates for GBP from Frankfurter"
- "Search for free image generation APIs"

---

## Architecture

```
┌─────────────────┐     stdio      ┌──────────────┐     HTTP      ┌──────────────┐
│  Claude Desktop │ ◄───────────►  │  free-api-mcp │ ◄───────────► │  305 APIs    │
│  Cursor         │   JSON-RPC     │  (local proc) │               │  (no auth)   │
│  VS Code        │                │               │               │              │
└─────────────────┘                └──────────────┘               └──────────────┘
```

The server runs as a local child process on your machine. All API calls go directly from your computer to the external APIs — no proxy, no middleman, no bandwidth costs.

---

## Categories

| Category | APIs | Category | APIs |
|---|---|---|---|
| Development | 34 | Entertainment | 30 |
| Finance | 22 | Government | 20 |
| Data | 19 | Fun | 17 |
| Education | 14 | Science | 14 |
| Weather | 12 | Health | 12 |
| Transportation | 11 | Geocoding | 8 |
| Sports | 8 | News | 8 |
| Food | 8 | Media | 7 |
| Security | 5 | Animals | 5 |
| AI | 3 | Music | 2 |
| +20 more categories... | | | |

---

## Data Source

The API list is curated and maintained at [Free API Explorer](https://github.com/Stevechaapps/api-explorer) — a static directory of 305 verified no-auth APIs with documentation, code examples, and use cases.

---
## Contributing

Contributions are welcome! Here's how you can help:

- **Add new APIs** — Found a great free API? Add it to the [api-explorer](https://github.com/Stevechaapps/api-explorer) dataset.
- **Bug reports** — Open an issue with steps to reproduce.
- **Feature requests** — Have an idea? Open a discussion or issue.
- **Pull requests** — Fork the repo, create a branch, and submit a PR.

### Development

```bash
git clone https://github.com/Stevechaapps/free-api-mcp.git
cd free-api-mcp
npm install
node --check index.js        # Verify syntax
node --check lib/tools.js
node --check lib/cache.js
```

## Roadmap

- [x] 305 free no-auth APIs
- [x] MCP stdio transport
- [x] In-memory caching with TTL
- [x] Exact + fuzzy API matching
- [x] CI pipeline
- [x] Resource exposure for static API data
- [x] JSON validation with Zod
- [x] Docker support
- [ ] Streaming transport support


## Support

If this saves you time or helps you build something cool:

[![Donate via PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/donate?hosted_button_id=XR297MKXBAMBS)

---

## License

MIT
