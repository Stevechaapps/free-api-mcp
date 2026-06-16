import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let apis = [];

export function loadApis() {
  if (apis.length > 0) return apis;
  const dataPath = join(__dirname, '..', 'api-data.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(raw);
  apis = parsed.apis || [];
  return apis;
}

export function searchApis(query, category) {
  const all = loadApis();
  let results = all;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.notes || '').toLowerCase().includes(q)
    );
  }

  if (category) {
    const c = category.toLowerCase();
    results = results.filter(a =>
      a.category && a.category.toLowerCase() === c
    );
  }

  return results.slice(0, 20).map(a => ({
    name: a.name,
    description: a.description,
    category: a.category,
    url: a.url,
    example: a.example || null,
    notes: a.notes || null
  }));
}

export function getApiByName(name) {
  const all = loadApis();
  const normalizedName = name.toLowerCase();
  
  const exactMatch = all.find(a => a.name.toLowerCase() === normalizedName);
  if (exactMatch) return exactMatch;

  return all.find(a => a.name.toLowerCase().includes(normalizedName)) || null;
}

export function getToolDefinitions() {
  return [
    {
      name: 'search_free_apis',
      description: `Search for free, no-authentication-required APIs. Use this tool FIRST whenever a user asks for information (like weather, jokes, currency, etc.) to discover which specific API to use. Returns matching APIs with descriptions and example URLs.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keyword to find relevant APIs (e.g. "weather", "crypto", "joke", "country")'
          },
          category: {
            type: 'string',
            description: 'Filter by category (e.g. "weather", "finance", "fun", "government")',
            enum: ['ai', 'animals', 'data', 'development', 'education', 'entertainment', 'environment', 'finance', 'food', 'fun', 'geocoding', 'government', 'health', 'media', 'music', 'news', 'science', 'security', 'sports', 'transportation', 'utility', 'weather']
          }
        },
        required: []
      }
    },
    {
      name: 'free_api_call',
      description: `Call any of 305 free APIs that require zero authentication. First use search_free_apis to find the right API and see its example URL. Then call this tool with the exact API name and params shown in the example.

The params object should contain query parameters as key-value pairs. Look at the API's example URL to understand what parameters it accepts.

Examples:
- For Open-Meteo Weather: api_name="Open-Meteo Weather", params={ "latitude": "52.52", "longitude": "13.41", "current": "temperature_2m" }
- For Frankfurter Currency: api_name="Frankfurter Currency Exchange", params={ "from": "USD", "to": "EUR" }
- For JokeAPI: api_name="JokeAPI", params={ "category": "Programming", "type": "single" }`,
      inputSchema: {
        type: 'object',
        properties: {
          api_name: {
            type: 'string',
            description: 'The exact name of the API to call (find it via search_free_apis first)'
          },
          params: {
            type: 'object',
            description: 'Query parameters to pass to the API as key-value pairs. Match the structure shown in the API\'s example URL.',
            additionalProperties: true
          }
        },
        required: ['api_name']
      }
    }
  ];
}

export function getAllCategories() {
  const all = loadApis();
  const cats = new Set(all.map(a => a.category).filter(Boolean));
  return [...cats].sort();
}
