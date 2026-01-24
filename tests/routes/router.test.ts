import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleRoute, matchRoute, sendJSON } from "../../src/routes/router.js";

// Mock the route handlers
vi.mock("../../src/routes/artists/POST.js", () => ({
  post: vi.fn(),
}));

vi.mock("../../src/routes/search/GET.js", () => ({
  get: vi.fn(),
}));

import { post } from "../../src/routes/artists/POST.js";
import { get } from "../../src/routes/search/GET.js";

describe("Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (
    url: string,
    method: string = "GET",
  ): IncomingMessage => {
    const req = new EventEmitter() as IncomingMessage;
    req.url = url;
    req.method = method;
    req.headers = { host: "localhost:3000" };
    return req;
  };

  const createMockResponse = () =>
    ({
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    }) as unknown as ServerResponse;

  describe("matchRoute", () => {
    it("should match GET /search route", () => {
      const route = matchRoute("GET", "/search");

      expect(route).toBeDefined();
      expect(route?.method).toBe("GET");
      expect(route?.path).toBe("/search");
      expect(route?.handler).toBe(get);
    });

    it("should match POST /artist route", () => {
      const route = matchRoute("POST", "/artist");

      expect(route).toBeDefined();
      expect(route?.method).toBe("POST");
      expect(route?.path).toBe("/artist");
      expect(route?.handler).toBe(post);
    });

    it("should return undefined for non-existent path", () => {
      const route = matchRoute("GET", "/nonexistent");

      expect(route).toBeUndefined();
    });

    it("should return undefined for wrong method on existing path", () => {
      const route = matchRoute("POST", "/search");

      expect(route).toBeUndefined();
    });
  });

  describe("sendJSON", () => {
    it("should set status code, content-type header, and send JSON response", () => {
      const res = createMockResponse();
      const data = { message: "Success", value: 123 };

      sendJSON(res, 200, data);

      expect(res.statusCode).toBe(200);
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json",
      );
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(data));
    });
  });

  describe("handleRoute", () => {
    it("should call matched route handler for valid route", async () => {
      const req = createMockRequest("/search?query=test", "GET");
      const res = createMockResponse();

      await handleRoute(req, res);

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          pathname: "/search",
          searchParams: expect.any(URLSearchParams),
        }),
      );
    });

    it("should return 404 for non-existent route", async () => {
      const req = createMockRequest("/nonexistent", "GET");
      const res = createMockResponse();

      await handleRoute(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Not found" }),
      );
      expect(get).not.toHaveBeenCalled();
      expect(post).not.toHaveBeenCalled();
    });

    it("should handle missing URL and default to GET method", async () => {
      const req = createMockRequest("", "");
      req.url = undefined;
      req.method = undefined;
      const res = createMockResponse();

      await handleRoute(req, res);

      // With no URL and GET method, it should try to match GET / which doesn't exist
      expect(res.statusCode).toBe(404);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Not found" }),
      );
    });
  });
});
