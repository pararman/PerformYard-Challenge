// Barely used here since the add is so simple but worth having in case the add becomes more complicated

// involved later on. Also keeps the route handler cleaner.

import { incrementCacheVersion } from "./cacheService.js";
import { addMusicalArtist, getGenres } from "./databaseService.js";

/**
 * Adds a new musical artist to the database after validating it doesn't already exist.
 * @param genre - The genre to which the artist belongs
 * @param artist - The name of the artist to add
 * @throws Error if the artist already exists in the specified genre
 */
export function addArtistService(genre: string, artist: string): void {
  // Retrieve existing artists
  const genreList = getGenres();
  // Validate the artist isn't already in the database
  if (genreList[genre]?.includes(artist)) {
    throw new Error(`Artist "${artist}" already exists in genre "${genre}".`);
  }
  // Add the new artist
  addMusicalArtist(genre, artist);

  // clear the cache (increment version and wipe out existing values)
  incrementCacheVersion();
}
