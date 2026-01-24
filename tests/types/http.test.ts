import { describe, expect, it } from "vitest";
import type { Route, RouteHandler } from "../../src/types/http.js";

describe("HTTP Types", () => {
  it("should accept valid RouteHandler implementation", () => {
    const handler: RouteHandler = async (_req, res, _url) => {
      res.statusCode = 200;
      res.end("OK");
    };

    expect(typeof handler).toBe("function");
  });

  it("should accept valid Route object", () => {
    const mockHandler: RouteHandler = async (_req, res, _url) => {
      res.end("OK");
    };

    const route: Route = {
      method: "GET",
      path: "/test",
      handler: mockHandler,
    };

    expect(route.method).toBe("GET");
    expect(route.path).toBe("/test");
    expect(typeof route.handler).toBe("function");
  });
});
