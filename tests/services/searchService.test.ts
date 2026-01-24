import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchService } from "../../src/services/searchService.js";

// Mock the database service
vi.mock("../../src/services/databaseService.js", () => ({
  getPeople: vi.fn(),
  getGenres: vi.fn(),
}));

import { getGenres, getPeople } from "../../src/services/databaseService.js";

describe("searchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should match name and return score of 4", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "John Smith", musicGenres: [], movies: [], location: "" },
      { name: "Jane Doe", musicGenres: [], movies: [], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const results = searchService("john");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("John Smith");
    expect(results[0].score).toBe(4);
    expect(results[0].matches).toEqual(["name"]);
  });

  it("should match genre and return score of 1", () => {
    vi.mocked(getPeople).mockReturnValue([
      {
        name: "Alice",
        musicGenres: ["Rock", "Jazz"],
        movies: [],
        location: "",
      },
      { name: "Bob", musicGenres: ["Pop"], movies: [], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const results = searchService("rock");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Alice");
    expect(results[0].score).toBe(1);
    expect(results[0].matches).toEqual(["genre"]);
  });

  it("should match movie and return score of 1", () => {
    vi.mocked(getPeople).mockReturnValue([
      {
        name: "Charlie",
        musicGenres: [],
        movies: ["The Matrix", "Inception"],
        location: "",
      },
      { name: "Diana", musicGenres: [], movies: ["Titanic"], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const results = searchService("matrix");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Charlie");
    expect(results[0].score).toBe(1);
    expect(results[0].matches).toEqual(["movie"]);
  });

  it("should match location and return score of 1", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "Eve", musicGenres: [], movies: [], location: "New York" },
      { name: "Frank", musicGenres: [], movies: [], location: "Los Angeles" },
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const results = searchService("york");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Eve");
    expect(results[0].score).toBe(1);
    expect(results[0].matches).toEqual(["location"]);
  });

  it("should match artist and return score of 2", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "Grace", musicGenres: ["Rock"], movies: [], location: "" },
      { name: "Henry", musicGenres: ["Jazz"], movies: [], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({
      Rock: ["The Beatles", "Led Zeppelin"],
      Jazz: ["Miles Davis"],
    });

    const results = searchService("beatles");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Grace");
    expect(results[0].score).toBe(2);
    expect(results[0].matches).toEqual(["artist"]);
  });

  it("should combine multiple match types and sum scores correctly", () => {
    vi.mocked(getPeople).mockReturnValue([
      {
        name: "Isabella",
        musicGenres: ["Rock"],
        movies: ["The Godfather"],
        location: "New York",
      },
    ]);
    vi.mocked(getGenres).mockReturnValue({
      Rock: ["The Beatles"],
    });

    const results = searchService("the");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Isabella");
    expect(results[0].score).toBe(3); // movie (1) + artist (2)
    expect(results[0].matches).toContain("movie");
    expect(results[0].matches).toContain("artist");
  });

  it("should count artist property once even when multiple genres have matching artists", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "Jack", musicGenres: ["Rock", "Pop"], movies: [], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({
      Rock: ["Artist A"],
      Pop: ["Artist A"], // Same artist in different genre
    });

    const results = searchService("artist");

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(2); // Should only count once
    const artistCount = results[0].matches.filter((m) => m === "artist").length;
    expect(artistCount).toBe(1);
  });

  it("should be case insensitive", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "Kate", musicGenres: ["ROCK"], movies: [], location: "" },
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const lowerResults = searchService("rock");
    const upperResults = searchService("ROCK");
    const mixedResults = searchService("RoCk");

    expect(lowerResults).toEqual(upperResults);
    expect(lowerResults).toEqual(mixedResults);
    expect(lowerResults[0].name).toBe("Kate");
  });

  it("should return empty array when no matches found", () => {
    vi.mocked(getPeople).mockReturnValue([
      {
        name: "Leo",
        musicGenres: ["Jazz"],
        movies: ["Inception"],
        location: "Paris",
      },
    ]);
    vi.mocked(getGenres).mockReturnValue({ Jazz: ["Miles Davis"] });

    const results = searchService("zzzzz");

    expect(results).toEqual([]);
  });

  it("should sort results by score descending, then by name ascending", () => {
    vi.mocked(getPeople).mockReturnValue([
      { name: "Zara", musicGenres: ["Rock"], movies: [], location: "" }, // score: 1
      { name: "Adam", musicGenres: ["Rock"], movies: [], location: "" }, // score: 1
      { name: "Mike", musicGenres: [], movies: [], location: "Rockville" }, // score: 1
      { name: "Sarah Rock", musicGenres: [], movies: [], location: "" }, // score: 4
    ]);
    vi.mocked(getGenres).mockReturnValue({});

    const results = searchService("rock");

    expect(results).toHaveLength(4);
    // First should be highest score
    expect(results[0].name).toBe("Sarah Rock");
    expect(results[0].score).toBe(4);
    // Next three should be alphabetically sorted (same score of 1)
    expect(results[1].name).toBe("Adam");
    expect(results[2].name).toBe("Mike");
    expect(results[3].name).toBe("Zara");
  });
});
