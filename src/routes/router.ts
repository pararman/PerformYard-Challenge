import type http from "node:http";
import { URL } from "node:url";
import type { Route } from "../types/http.js";
import { post } from "./artists/POST.js";
import { get } from "./search/GET.js";

export const routes: Route[] = [
  { method: "GET", path: "/search", handler: get },
  { method: "POST", path: "/artist", handler: post },
];

export function matchRoute(
  method: string,
  pathname: string,
): Route | undefined {
  return routes.find(
    (route) => route.method === method && route.path === pathname,
  );
}

export function sendJSON(
  res: http.ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export async function handleRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const method = req.method || "GET"; // Add default case just so we don't have to deal with optional for now, TODO can throw an error if no method is passed in

  // Match route
  const route = matchRoute(method, url.pathname);

  if (route) {
    await route.handler(req, res, url);
  } else {
    sendJSON(res, 404, { error: "Not found" });
  }
}
