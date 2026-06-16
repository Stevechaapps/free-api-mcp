#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { getToolDefinitions, searchApis, getApiByName } from './lib/tools.js';
import * as cache from './lib/cache.js';
import { SearchApisSchema, FreeApiCallSchema } from './lib/validation.js';

const log = (message, data = '') => {
  process.stderr.write(`[${new Date().toISOString()}] ${message} ${data ? JSON.stringify(data) : ''}\n`);
};

const server = new Server(
  {
    name: 'free-api-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getToolDefinitions()
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_free_apis') {
    log('Tool call: search_free_apis', { query: args?.query, category: args?.category });
    const parsed = SearchApisSchema.parse(args ?? {});
    const results = searchApis(parsed.query, parsed.category);
    const text = results.length === 0
      ? 'No APIs found matching your search. Try broader terms or browse all 40 categories.'
      : results.map((a, i) =>
          `${i + 1}. **${a.name}** (${a.category})\n   ${a.description}\n   URL: ${a.url}\n   Example: ${a.example || 'See docs'}`
        ).join('\n\n');
    return {
      content: [{ type: 'text', text }]
    };
  }

  if (name === 'free_api_call') {
    log('Tool call: free_api_call', { api_name: args?.api_name });
    const parsed = FreeApiCallSchema.safeParse(args ?? {});
    if (!parsed.success) {
      throw new McpError(ErrorCode.InvalidParams, parsed.error.issues[0].message);
    }

    const api = getApiByName(parsed.data.api_name);
    if (!api) {
      const suggestions = searchApis(parsed.data.api_name, '');
      const hint = suggestions.length > 0
        ? ` Did you mean one of: ${suggestions.map(a => `"${a.name}"`).join(', ')}?`
        : ' Use search_free_apis to find the right API name.';
      throw new McpError(ErrorCode.InvalidParams, `API "${parsed.data.api_name}" not found.${hint}`);
    }

    const params = parsed.data.params ?? {};
    const url = new URL(api.url);
    Object.entries(params).forEach(([key, value]) => {
      if (typeof key === 'string') {
        url.searchParams.set(key, String(value ?? ''));
      }
    });

    const cacheKey = url.toString();
    const cached = cache.get(cacheKey);
    if (cached) {
      log('Cache hit', { url: cacheKey });
      return {
        content: [{ type: 'text', text: JSON.stringify(cached, null, 2) }]
      };
    }

    log('Fetching API', { url: cacheKey });
    try {
      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'free-api-mcp/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new McpError(
          ErrorCode.InternalError,
          `API returned ${response.status} ${response.statusText}`
        );
      }

      const data = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : await response.text();

      cache.set(cacheKey, data, 30000);

      const output = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      return {
        content: [{ type: 'text', text: output }]
      };
    } catch (err) {
      log('Request failed', { error: err.message });
      if (err instanceof McpError) throw err;
      throw new McpError(
        ErrorCode.InternalError,
        `Request failed: ${err.message}`
      );
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
