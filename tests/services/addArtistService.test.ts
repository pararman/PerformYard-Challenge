import { beforeEach, describe, expect, it, vi } from "vitest";
import { addArtistService } from "../../src/services/addArtistService.js";

// Mock the database service
vi.mock("../../src/services/databaseService.js", () => ({
  getGenres: vi.fn(),
  addMusicalArtist: vi.fn(),
}));

import {
  addMusicalArtist,
  getGenres,
} from "../../src/services/databaseService.js";

describe("Add Artist Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully add an artist when not finding an already existing entry", () => {
    vi.mocked(getGenres).mockReturnValue({
      Rock: ["The Beatles", "Queen"],
      Jazz: ["Miles Davis"],
    });

    addArtistService("Rock", "Led Zeppelin");

    expect(getGenres).toHaveBeenCalledTimes(1);
    expect(addMusicalArtist).toHaveBeenCalledWith("Rock", "Led Zeppelin");
    expect(addMusicalArtist).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when finding an already existing entry", () => {
    vi.mocked(getGenres).mockReturnValue({
      Rock: ["The Beatles", "Queen"],
      Jazz: ["Miles Davis"],
    });

    expect(() => {
      addArtistService("Rock", "The Beatles");
    }).toThrow('Artist "The Beatles" already exists in genre "Rock".');

    expect(getGenres).toHaveBeenCalledTimes(1);
    expect(addMusicalArtist).not.toHaveBeenCalled();
  });
});
