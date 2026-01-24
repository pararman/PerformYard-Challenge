import { getGenres, getPeople } from "./databaseService.js";

// Middle layer between route handler and database service
// Retrieves data and organizes it according to search criteria

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
 * @returns An array of search results with name, score, and match categories
 * example: [{ name: "John Doe", score: 6, matches: ["name", "artist"] }]
 */
export function searchService(query: string) {
  const queryLowerCase = query.toLowerCase();
  const people = getPeople();
  const genreList = getGenres();
  const searchResults = [];
  for (const person of people) {
    let score = 0;
    const matches = [];
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
  // Sort results by score descending, then by name ascending
  searchResults.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
  return searchResults;
}
