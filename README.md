# Free API MCP Server

[![npm](https://img.shields.io/npm/v/free-api-mcp?style=flat-square&logo=npm)](https://www.npmjs.com/package/free-api-mcp)
[![GitHub Stars](https://img.shields.io/github/stars/Stevechaapps/free-api-mcp?style=flat-square&logo=github)](https://github.com/Stevechaapps/free-api-mcp/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**305 free APIs, zero authentication, now accessible to any AI agent.**

Weather forecasts, currency exchange rates, crypto prices, government data, AI/ML models, jokes, geocoding, news, sports — every API in this collection works without API keys, tokens, or signups. This MCP server makes them all available to Claude, Cursor, VS Code, ChatGPT, and any other MCP-compatible AI tool.

---

## Quick Start

### npx (no install)

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "free-api": {
      "command": "npx",
      "args": ["-y", "free-api-mcp"]
    }
  }
}
```

Restart Claude Desktop and the tools are available immediately.

### Cursor

```
Cursor → Settings → Features → MCP Servers → Add New
Name: free-api
Type: command
Command: npx -y free-api-mcp
```

### VS Code + Continue

```json
// .vscode/mcp.json or continue config
{
  "mcpServers": {
    "free-api": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "free-api-mcp"]
    }
  }
}
```

---

## Tools

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

## License

MIT
