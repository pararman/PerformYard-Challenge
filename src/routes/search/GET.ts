import z from "zod";
import { searchService } from "../../services/searchService.js";
import type { RouteHandler } from "../../types/http.js";
import { sendJSON } from "../router.js";

// Zod Schemas for parsing body/input
export const SearchQuerySchema = z
  .object({
    query: z.string().min(1, 'Query parameter "query" is required'),
  })
  .strict();

export const SearchResultSchema = z.object({
  name: z.string(),
  score: z.number(),
  matches: z.array(z.string()),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

// Route Handler for invoking the searchService
export const get: RouteHandler = async (_req, res, url) => {
  console.log("GET invoked!");
  const queryParams = Object.fromEntries(url.searchParams);

  const parsedQuery = SearchQuerySchema.safeParse(queryParams);
  if (!parsedQuery.success) {
    sendJSON(res, 400, {
      error: "Invalid query parameter",
      details: parsedQuery.error.errors,
    });
    return;
  }
  const matches = searchService(parsedQuery.data.query);
  sendJSON(res, 200, { message: matches });
};
