import { initBotId } from 'botid/client/core';

// Vercel BotID - https://vercel.com/docs/botid
// Define the paths that need bot protection
// These are high-value endpoints that bots commonly target
// These can be:
// - API endpoints (e.g., '/api/checkout')
// - Server actions invoked from a page (e.g., '/dashboard')
// - Dynamic routes (e.g., '/api/create/*')
initBotId({
  protect: [
    // Checkout - Deep Analysis only for payment-related routes (fraud prevention)
    // Other routes use free Vercel Bot Protection + AI Bots blocking
    { path: '/api/checkout/*', method: 'POST' },
  ],
});
