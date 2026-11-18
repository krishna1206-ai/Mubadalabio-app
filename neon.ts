// Neon services for this project (https://neon.com/docs/reference/neon-ts).
// Postgres is always on; the AI Gateway powers the admin panel's auto-translation.
import { defineConfig } from '@neon/config/v1';

export default defineConfig({
  aiGateway: true,
});
