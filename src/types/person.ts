import { z } from "zod";

/**
 * Schema for a person in the database with their preferences
 */
export const PersonSchema = z.object({
  name: z.string(),
  musicGenres: z.array(z.string()),
  movies: z.array(z.string()),
  location: z.string(),
});

export type Person = z.infer<typeof PersonSchema>;
