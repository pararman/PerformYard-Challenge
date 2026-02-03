import { z } from "zod";
import { getGenres, getPeople } from "./databaseService.js";
import { getFromCache, storeInCache } from "./cacheService.js";

// Middle layer between route handler and database service
// Retrieves data and organizes it according to search criteria

export const SearchResultSchema = z.object({
  name: z.string(),
  score: z.number(),
  matches: z.array(z.enum(["name", "genre", "movie", "location", "artist"])),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Scoring rules (case‑insensitive, substring matches, count each property at most once):
// Name match: 4 points
// Music genre match: 1 point
// Movie match: 1 point
// Location match: 1 point
// Musical artist match: 2 points
// Return only those with score > 0, sor

/**
 * Searches the database for people matching the query.
 * The search checks based on the scoring rules defined above.
 * @param query the query to search
 * @param sortRule the sorting rule to pass back the data, either name or score
 * @param isAscending whether the results are ascending or descending
 * @returns An array of search results with name, score, and match categories
 * example: [{ name: "John Doe", score: 6, matches: ["name", "artist"] }]
 */
export function searchService(query: string, sortRule?: string, isAscending?: string) {
  const queryLowerCase = query.toLowerCase();

  // Some way to access cache here
  // cache.ts
  try {
    const cachedResult = getFromCache(query, sortRule, isAscending)
    return cachedResult
  } catch (error: any) {
    if (error instanceof Error && error.message === 'No cache value found') {
      // Cache miss, continue with normal search
    }
  }

  const people = getPeople();
  const genreList = getGenres();
  const searchResults: SearchResult[] = [];
  for (const person of people) {
    let score = 0;
    const matches: ("name" | "genre" | "movie" | "location" | "artist")[] = [];
    let artistMatched = false;
    // Name match
    if (person.name.toLowerCase().includes(queryLowerCase)) {
      score += 4;
      matches.push("name");
    }
    // Music genre match
    if (
      person.musicGenres.some((genre) =>
        genre.toLowerCase().includes(queryLowerCase),
      )
    ) {
      score += 1;
      matches.push("genre");
    }
    // Movie match
    if (
      person.movies.some((movie) =>
        movie.toLowerCase().includes(queryLowerCase),
      )
    ) {
      score += 1;
      matches.push("movie");
    }
    // Location match
    if (person.location.toLowerCase().includes(queryLowerCase)) {
      score += 1;
      matches.push("location");
    }
    // Musical artist match
    for (const genre of person.musicGenres) {
      if (genreList[genre]) {
        for (const artist of genreList[genre]) {
          if (artist.toLowerCase().includes(queryLowerCase)) {
            if (!artistMatched) {
              score += 2;
              matches.push("artist");
              artistMatched = true;
            }
            break; // Only count one artist match per genre
          }
        }
        if (artistMatched) break; // Stop checking other genres if we found an artist match
      }
    }
    if (score > 0) {
      console.log(
        `Person: ${person.name}, Score: ${score}, Matches: ${matches.join(", ")}`,
      );
      searchResults.push({ name: person.name, score, matches });
    } else {
      console.log(`Person: ${person.name} has no matches.`);
    }
  }
  // Sorting rules passed in
  if (sortRule) {
    // name and descending case
    if ((sortRule == 'name') && (isAscending == 'false')) {
      searchResults.sort((a, b) => {
        // Sort by name descending (Z to A)
        const nameComparison = b.name.localeCompare(a.name);
        if (nameComparison !== 0) return nameComparison;
        // If names are equal, use score as tiebreaker (higher score first)
        return b.score - a.score;
      });
    }
    // name and ascending case
    else if ((sortRule == 'name') && (isAscending == 'true')) {
        searchResults.sort((a, b) => {
        // Sort by name descending (Z to A)
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison !== 0) return nameComparison;
        // If names are equal, use score as tiebreaker (higher score first)
        return a.score - b.score;
      });
    }
    else if (sortRule == 'score' && (isAscending == 'false')) {
      searchResults.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name);
      });
    }
    else if (sortRule == 'score' && (isAscending == 'true')) {
        searchResults.sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }
        return b.name.localeCompare(a.name);
      });
    }
  }
  // No sorting case
  else {
    searchResults.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });
  }

  storeInCache(searchResults, query, sortRule, isAscending)
  return searchResults;
}
