// This file is specifically for Vercel serverless deployment
import app from '../server.js';

// Export a serverless function handler
export default async function handler(req, res) {
  // Forward the request to the Express app
  return app(req, res);
}
