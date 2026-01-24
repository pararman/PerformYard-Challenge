import { describe, expect, it } from "vitest";
import {
  addMusicalArtist,
  getGenres,
  getPeople,
} from "../../src/services/databaseService.js";

describe("Database Service", () => {
  it("should return array of people from getPeople", () => {
    const people = getPeople();

    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThan(0);
    expect(people[0]).toHaveProperty("name");
    expect(people[0]).toHaveProperty("musicGenres");
    expect(people[0]).toHaveProperty("movies");
    expect(people[0]).toHaveProperty("location");
  });

  it("should return genres object from getGenres", () => {
    const genres = getGenres();

    expect(typeof genres).toBe("object");
    expect(Object.keys(genres).length).toBeGreaterThan(0);
  });

  it("should add artist to existing genre", () => {
    const genresBefore = getGenres();
    const existingGenre = Object.keys(genresBefore)[0];
    const initialLength = genresBefore[existingGenre].length;

    addMusicalArtist(existingGenre, "Test Artist");

    const genresAfter = getGenres();
    expect(genresAfter[existingGenre].length).toBe(initialLength + 1);
    expect(genresAfter[existingGenre]).toContain("Test Artist");
  });

  it("should create new genre when adding artist to non-existent genre", () => {
    const newGenre = `TestGenre_${Date.now()}`;
    addMusicalArtist(newGenre, "New Artist");

    const genres = getGenres();
    expect(genres[newGenre]).toBeDefined();
    expect(genres[newGenre]).toEqual(["New Artist"]);
  });
});
