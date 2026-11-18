// Vercel entry point: serves the exported Expo app (pages + src/app/**/+api.ts routes).
// See https://docs.expo.dev/router/web/api-routes/ (Vercel section).
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS form from the Expo docs for Vercel */
const { createRequestHandler } = require('expo-server/adapter/vercel');

module.exports = createRequestHandler({
  build: require('path').join(__dirname, '../dist/server'),
});
