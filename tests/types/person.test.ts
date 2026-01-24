import { describe, expect, it } from "vitest";
import { PersonSchema, SearchResultSchema } from "../../src/types/person.js";

describe("Person Types", () => {
  describe("PersonSchema", () => {
    it("should validate valid person object", () => {
      const validPerson = {
        name: "John Doe",
        musicGenres: ["Rock", "Jazz"],
        movies: ["The Matrix", "Inception"],
        location: "New York",
      };

      const result = PersonSchema.safeParse(validPerson);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPerson);
      }
    });

    it("should reject person object missing required fields", () => {
      const invalidPerson = {
        name: "John Doe",
        musicGenres: ["Rock"],
        // Missing movies and location
      };

      const result = PersonSchema.safeParse(invalidPerson);

      expect(result.success).toBe(false);
    });
  });

  describe("SearchResultSchema", () => {
    it("should validate valid search result object", () => {
      const validResult = {
        name: "John Doe",
        score: 5,
        matches: ["name", "artist"],
      };

      const result = SearchResultSchema.safeParse(validResult);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validResult);
      }
    });

    it("should reject search result with invalid score type", () => {
      const invalidResult = {
        name: "John Doe",
        score: "five", // Should be a number
        matches: ["name"],
      };

      const result = SearchResultSchema.safeParse(invalidResult);

      expect(result.success).toBe(false);
    });
  });
});
