import { getPeople, getGenres } from './databaseService.js'

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
export function searchService(query: String) {
    const queryLowerCase = query.toLowerCase();
    const people = getPeople();
    const searchResults = [];
    for (const person of people) {
        let score = 0
        const matches = [];
        console.log(person);
        // Name match
        if (person.name.toLowerCase().includes(queryLowerCase)) {
            console.log("Matched: " + person.name);
            score += 4;
            matches.push('name');
        }
        // Music genre match
        if (person.musicGenres.some(genre => genre.toLowerCase().includes(queryLowerCase))) {
            console.log("Matched genre for: " + person.name);
            score += 1;
            matches.push('genre');
        }
        // Movie match
        if (person.movies.some(movie => movie.toLowerCase().includes(queryLowerCase))) {
            console.log("Matched movie for: " + person.name);
            score += 1;
            matches.push('movie');
        }
        // Location match
        if (person.location.toLowerCase().includes(queryLowerCase)) {
            console.log("Matched location for: " + person.name);
            score += 1;
            matches.push('location');
        }
        // Musical artist match
        const genreList = getGenres();
        for (const genre of person.musicGenres) {
            if (genreList[genre]) {
                console.log('Checking genre: ' + genre);
                for (const artist of genreList[genre]) {
                    if (artist.toLowerCase().includes(queryLowerCase)) {
                        score += 2;
                        matches.push('artist');
                        break; // Only count one artist match per genre as we don't want to track duplicates
                    }
                }
            }
        }
        if (score > 0) {
            console.log(`Person: ${person.name}, Score: ${score}, Matches: ${matches.join(', ')}`);
            searchResults.push({ name: person.name, score, matches });
        } else {
            console.log(`Person: ${person.name} has no matches.`);
        }
    }
    // Sort results by score descending
    searchResults.sort((a, b) => b.score - a.score);
    return searchResults;
}