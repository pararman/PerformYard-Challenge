import { describe, expect, it } from "vitest";
import { genresSchema } from "../../src/types/artist.js";

describe("Artist Types", () => {
  it("should validate valid genres object", () => {
    const validGenres = {
      Rock: ["The Beatles", "Led Zeppelin"],
      Jazz: ["Miles Davis"],
    };

    const result = genresSchema.safeParse(validGenres);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validGenres);
    }
  });

  it("should reject invalid genres object with non-array values", () => {
    const invalidGenres = {
      Rock: "The Beatles", // Should be an array
    };

    const result = genresSchema.safeParse(invalidGenres);

    expect(result.success).toBe(false);
  });

  it("should validate empty genres object", () => {
    const emptyGenres = {};

    const result = genresSchema.safeParse(emptyGenres);

    expect(result.success).toBe(true);
  });
});
