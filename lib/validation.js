import { z } from 'zod';

const categories = ['ai', 'animals', 'data', 'development', 'education', 'entertainment', 'environment', 'finance', 'food', 'fun', 'geocoding', 'government', 'health', 'media', 'music', 'news', 'science', 'security', 'sports', 'transportation', 'utility', 'weather'];

export const SearchApisSchema = z.object({
  query: z.string().optional().default(''),
  category: z.enum(categories).optional().default('')
});

export const FreeApiCallSchema = z.object({
  api_name: z.string().min(1, 'api_name is required'),
  params: z.record(z.string(), z.unknown()).optional().default({})
});
