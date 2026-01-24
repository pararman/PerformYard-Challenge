import http from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the router module
vi.mock("../src/routes/router.js", () => ({
  handleRoute: vi.fn(),
}));

// Mock http.createServer
const mockServer = {
  listen: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
} as unknown as http.Server;

vi.spyOn(http, "createServer").mockReturnValue(mockServer);

describe("Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an HTTP server instance", async () => {
    const { createServer } = await import("../src/index.js");

    // Clear the call count from module initialization
    vi.clearAllMocks();

    const server = createServer();

    expect(http.createServer).toHaveBeenCalledTimes(1);
    expect(server).toBe(mockServer);
  });
});
