// Using a local object/database for data reading purposes.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Genres } from "../types/artist.js";
import type { Person } from "../types/person.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let people: Person[];
let musicArtists: Genres;

/**
 * Loads Data from the database
 *
 * @returns void
 * @throws error if unable to load data
 */
function loadData(): { people: Person[]; musicArtists: Genres } {
  try {
    const dataPath = join(__dirname, "../../data.json");
    const fileContent = readFileSync(dataPath, "utf-8");
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("Error loading data.json:", error);
    throw new Error("Failed to load database from data.json");
  }
}

/**
 * Initialize data on module load
 * NOTE this will refresh every time the Node server restarts
 */
const data = loadData();
people = data.people;
musicArtists = data.musicArtists;

export function getPeople(): Person[] {
  return people;
}

export function getGenres(): Genres {
  return musicArtists;
}

export function addMusicalArtist(genre: string, artist: string): void {
  if (musicArtists[genre]) {
    musicArtists[genre].push(artist);
  } else {
    musicArtists[genre] = [artist];
  }
}
