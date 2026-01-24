import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { post } from "../../../src/routes/artists/POST.js";

// Mock the addArtistService module
vi.mock("../../../src/services/addArtistService.js", () => ({
  addArtistService: vi.fn(),
}));

import { addArtistService } from "../../../src/services/addArtistService.js";

describe("POST /artist", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default mock behavior - successful addition
    vi.mocked(addArtistService).mockReturnValue(undefined);
  });

  const createMockRequest = (body: string): IncomingMessage => {
    const req = new EventEmitter() as IncomingMessage;

    // Simulate async body reading
    setTimeout(() => {
      req.emit("data", body);
      req.emit("end");
    }, 0);

    return req;
  };

  const createMockResponse = () =>
    ({
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    }) as unknown as ServerResponse;

  describe("Body Parsing", () => {
    it("should successfully parse valid JSON body", async () => {
      const req = createMockRequest(
        '{"genre": "Rock", "artist": "The Beatles"}',
      );
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(addArtistService).toHaveBeenCalledWith("Rock", "The Beatles");
      expect(res.statusCode).toBe(201);
    });

    it("should return 400 for invalid JSON", async () => {
      const req = createMockRequest("invalid json{");
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid JSON body"),
      );
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should return 400 for missing genre field", async () => {
      const req = createMockRequest('{"artist": "Test Artist"}');
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid body parameters"),
      );
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should return 400 for missing artist field", async () => {
      const req = createMockRequest('{"genre": "Rock"}');
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid body parameters"),
      );
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should return 400 for empty genre string", async () => {
      const req = createMockRequest('{"genre": "", "artist": "Test Artist"}');
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should return 400 for empty artist string", async () => {
      const req = createMockRequest('{"genre": "Rock", "artist": ""}');
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should return 400 for extra fields", async () => {
      const req = createMockRequest(`{
        "genre": "Jazz",
        "artist": "Miles Davis",
        "extraField": "should be rejected",
        "year": 1959
      }`);
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Invalid body parameters"),
      );
      expect(addArtistService).not.toHaveBeenCalled();
    });

    it("should handle special characters in parsed values", async () => {
      const req = createMockRequest(
        '{"genre": "Rock & Roll", "artist": "AC/DC"}',
      );
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(addArtistService).toHaveBeenCalledWith("Rock & Roll", "AC/DC");
      expect(res.statusCode).toBe(201);
    });

    it("should handle whitespace in parsed values", async () => {
      const req = createMockRequest(
        '{"genre": "Heavy Metal", "artist": "  Led Zeppelin  "}',
      );
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(addArtistService).toHaveBeenCalledWith(
        "Heavy Metal",
        "  Led Zeppelin  ",
      );
      expect(res.statusCode).toBe(201);
    });
  });
  describe("Sending data to database", () => {
    it("should call addArtistService with parsed body and return success response", async () => {
      const req = createMockRequest(
        '{"genre": "Blues", "artist": "B.B. King"}',
      );
      const res = createMockResponse();
      const url = new URL("http://localhost:3000/artist");

      await post(req, res, url);

      expect(addArtistService).toHaveBeenCalledWith("Blues", "B.B. King");
      expect(addArtistService).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(res.statusCode).toBe(201);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining("Artist added successfully"),
      );
    });
  });
  it("should return an error if the addition finds an already existing entry", async () => {
    const req = createMockRequest('{"genre": "Rock", "artist": "The Beatles"}');
    const res = createMockResponse();
    const url = new URL("http://localhost:3000/artist");

    // Mock addArtistService to throw an error for duplicate entry
    vi.mocked(addArtistService).mockImplementation(() => {
      throw new Error('Artist "The Beatles" already exists in genre "Rock"');
    });

    await post(req, res, url);

    expect(addArtistService).toHaveBeenCalledWith("Rock", "The Beatles");
    expect(res.statusCode).toBe(409);
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("already exists in"),
    );
  });
});
