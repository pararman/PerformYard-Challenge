import { z } from "zod";

/**
 * Schema for the artists, with key: Genre and values Artists
 * Maps genre names to arrays of artist names
 * Example: { "Rock": ["Led Zeppelin", "AC/DC"], "Jazz": ["Miles Davis"] }
 */
export const genresSchema = z.record(z.string(), z.array(z.string()));

export type Genres = z.infer<typeof genresSchema>;
