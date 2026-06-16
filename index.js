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
    const query = typeof args?.query === 'string' ? args.query : '';
    const category = typeof args?.category === 'string' ? args.category : '';
    const results = searchApis(query, category);
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
    const apiName = typeof args?.api_name === 'string' ? args.api_name : '';
    if (!apiName) {
      throw new McpError(ErrorCode.InvalidParams, 'api_name is required');
    }

    const api = getApiByName(apiName);
    if (!api) {
      const suggestions = searchApis(apiName, '');
      const hint = suggestions.length > 0
        ? ` Did you mean one of: ${suggestions.map(a => `"${a.name}"`).join(', ')}?`
        : ' Use search_free_apis to find the right API name.';
      throw new McpError(ErrorCode.InvalidParams, `API "${apiName}" not found.${hint}`);
    }

    const params = (args?.params && typeof args.params === 'object') ? args.params : {};
    const url = new URL(api.url);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const cacheKey = url.toString();
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached, null, 2) }]
      };
    }

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
