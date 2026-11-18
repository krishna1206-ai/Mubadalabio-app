import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

import { seedLeaders, seedMediaPosts } from './seed';

// Server-only module: import it from +api.ts files only, never from screens.

export type MessageStatus = 'new' | 'read';

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  department: string;
  message: string;
  status: MessageStatus;
  created_at: string;
};

type Sql = NeonQueryFunction<false, false>;

function client(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

async function migrate(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      mobile     TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL,
      message    TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  // Uploaded photos for media posts. Kept apart so post lists never load image bytes.
  await sql`
    CREATE TABLE IF NOT EXISTS media_images (
      id         SERIAL PRIMARY KEY,
      mime       TEXT NOT NULL,
      data       BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  // Press releases / news added from the admin panel. Shown alongside the built-in articles.
  await sql`
    CREATE TABLE IF NOT EXISTS media_posts (
      id         SERIAL PRIMARY KEY,
      lang       TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'ar')),
      badge      TEXT NOT NULL,
      title      TEXT NOT NULL,
      date       DATE NOT NULL,
      body       TEXT NOT NULL,
      url        TEXT NOT NULL DEFAULT '',
      image_id   INTEGER REFERENCES media_images(id) ON DELETE SET NULL,
      image_url  TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  // Imported posts keep their original link (/news/<slug>); admin-created posts have no slug.
  await sql`ALTER TABLE media_posts ADD COLUMN IF NOT EXISTS slug TEXT`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS media_posts_lang_slug ON media_posts (lang, slug)`;
  await sql`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;
  await seedMediaPosts(sql);
  // The same post in the other language (English ⇄ Arabic), kept in sync by auto-translation.
  await sql`ALTER TABLE media_posts ADD COLUMN IF NOT EXISTS pair_id INTEGER REFERENCES media_posts(id) ON DELETE SET NULL`;
  // Imported posts share a slug across languages: link those twins once.
  await sql`
    UPDATE media_posts a SET pair_id = b.id
    FROM media_posts b
    WHERE a.pair_id IS NULL AND a.slug IS NOT NULL AND a.slug = b.slug AND a.lang <> b.lang`;

  // Board of Directors and Leadership Team profiles, managed in /admin → Leadership.
  await sql`
    CREATE TABLE IF NOT EXISTS leaders (
      id         SERIAL PRIMARY KEY,
      lang       TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'ar')),
      grp        TEXT NOT NULL CHECK (grp IN ('board', 'team')),
      name       TEXT NOT NULL,
      role       TEXT NOT NULL,
      bio        TEXT NOT NULL DEFAULT '',
      photo_id   INTEGER REFERENCES media_images(id) ON DELETE SET NULL,
      photo_url  TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      pair_id    INTEGER REFERENCES leaders(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await seedLeaders(sql);
}

/** Bump when migrate() changes, so every database runs the new steps once. */
const SCHEMA_VERSION = '4';

/**
 * Runs migrate() only when the database is behind. A normal request costs one quick lookup;
 * re-running every CREATE/ALTER (≈9 round trips to the database) made each page load seconds slower.
 */
async function ensureSchema(sql: Sql) {
  try {
    const [row] = await sql`SELECT value FROM app_meta WHERE key = 'schema_version'`;
    if (row?.value === SCHEMA_VERSION) return;
  } catch {
    // app_meta doesn't exist yet: brand-new database
  }
  await migrate(sql);
  await sql`
    INSERT INTO app_meta (key, value) VALUES ('schema_version', ${SCHEMA_VERSION})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

// Kept on globalThis so it survives route modules being re-evaluated (as the dev server does),
// i.e. the check runs once per server process instead of once per request.
const store = globalThis as { __mubadalaSchemaReady?: Promise<void> };

/** Returns a query function, making sure the tables are up to date first. */
export function db() {
  const sql = client();
  store.__mubadalaSchemaReady ??= ensureSchema(sql).catch((e) => {
    store.__mubadalaSchemaReady = undefined; // retry on the next request
    throw e;
  });
  return store.__mubadalaSchemaReady.then(() => sql);
}
