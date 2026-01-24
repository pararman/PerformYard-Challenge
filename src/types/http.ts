import type http from "node:http";
import type { URL } from "node:url";

/**
 * Route handler function type
 * Handles HTTP requests and sends responses
 */
export type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  url: URL,
) => Promise<void> | void;

/**
 * Route configuration interface
 * Defines a route with HTTP method, path, and handler
 */
export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}
