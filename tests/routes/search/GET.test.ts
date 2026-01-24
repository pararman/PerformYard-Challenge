import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "../../../src/routes/search/GET.js";

// Mock the searchService module
vi.mock("../../../src/services/searchService.js", () => ({
  searchService: vi.fn(),
}));

import { searchService } from "../../../src/services/searchService.js";

describe("GET /search", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default mock behavior - return empty results
    vi.mocked(searchService).mockReturnValue([]);
  });

  const createMockRequest = (): IncomingMessage => {
    const req = new EventEmitter() as IncomingMessage;
    return req;
  };

  const createMockResponse = () =>
    ({
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    }) as unknown as ServerResponse;

  describe("Query Parameter Validation", () => {
    it("should successfully handle valid query parameter", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search?query=test");

      const mockResults = [{ name: "John Doe", score: 4, matches: ["name"] }];
      vi.mocked(searchService).mockReturnValue(mockResults);

      await get(req, res, url);

      expect(searchService).toHaveBeenCalledWith("test");
      expect(res.statusCode).toBe(200);
    });

    it("should return 400 for missing query parameter", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search");

      await get(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid query parameter"),
      );
      expect(searchService).not.toHaveBeenCalled();
    });

    it("should return 400 for empty query parameter", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search?query=");

      await get(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid query parameter"),
      );
      expect(searchService).not.toHaveBeenCalled();
    });

    it("should handle query with special characters", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL(
        "http://localhost:3000/search?query=rock%20%26%20roll",
      );

      vi.mocked(searchService).mockReturnValue([]);

      await get(req, res, url);

      expect(searchService).toHaveBeenCalledWith("rock & roll");
      expect(res.statusCode).toBe(200);
    });

    it("should handle query with whitespace", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL(
        "http://localhost:3000/search?query=%20%20jazz%20%20",
      );

      vi.mocked(searchService).mockReturnValue([]);

      await get(req, res, url);

      expect(searchService).toHaveBeenCalledWith("  jazz  ");
      expect(res.statusCode).toBe(200);
    });

    it("should return 400 for extra query parameters", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL(
        "http://localhost:3000/search?query=test&extra=value",
      );

      await get(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid query parameter"),
      );
      expect(searchService).not.toHaveBeenCalled();
    });
  });

  describe("Search Results", () => {
    it("should call searchService with query and return results", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search?query=beatles");

      const mockResults = [
        { name: "John Lennon", score: 6, matches: ["name", "artist"] },
        { name: "Paul McCartney", score: 2, matches: ["artist"] },
      ];
      vi.mocked(searchService).mockReturnValue(mockResults);

      await get(req, res, url);

      // Verify the service was called with the correct query
      expect(searchService).toHaveBeenCalledWith("beatles");
      expect(searchService).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("John Lennon"),
      );
    });

    it("should return empty results when no matches found", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search?query=nonexistent");

      vi.mocked(searchService).mockReturnValue([]);

      await get(req, res, url);

      expect(searchService).toHaveBeenCalledWith("nonexistent");
      expect(res.statusCode).toBe(200);
    });

    it("should return multiple results sorted by score", async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/search?query=rock");

      const mockResults = [
        {
          name: "Alice Cooper",
          score: 8,
          matches: ["name", "genre", "artist"],
        },
        { name: "Bob Dylan", score: 5, matches: ["name", "artist"] },
        { name: "Charlie Watts", score: 3, matches: ["genre", "artist"] },
      ];
      vi.mocked(searchService).mockReturnValue(mockResults);

      await get(req, res, url);

      expect(searchService).toHaveBeenCalledWith("rock");
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Alice Cooper"),
      );
    });
  });
});
