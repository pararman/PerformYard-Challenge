import http from 'node:http';
import { URL } from 'node:url';

import { handleRoute } from './routes/router.js' 

const PORT = 3000;


// Types
import { Route } from './types/http.js';

async function requestHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  // Delegate to route handler
  await handleRoute(req, res);
}

/**
 * Create and start the HTTP server
 */
export function createServer(): http.Server {
  return http.createServer(requestHandler);
}

// Start server
const server = createServer();
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /search?query=<query>`);
  console.log(`  POST /artist`);
  console.log(`  GET  /health`);
}); 