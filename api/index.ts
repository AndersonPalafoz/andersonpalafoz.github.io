import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import { app } from '../server/_core/index';

let server: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Lazy initialize the server
  if (!server) {
    server = createServer(app);
  }

  // Forward the request to the Express app
  return new Promise((resolve) => {
    server.emit('request', req, res);
    res.on('finish', () => resolve(undefined));
  });
}
