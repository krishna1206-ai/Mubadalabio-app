// Server-only module: Board of Directors / Leadership Team profiles.
import type { NeonQueryFunction } from '@neondatabase/serverless';

import type { TranslationResult } from './pairs';
import { deleteImageIfUnused } from './pairs';
import { otherLang, translatePost, TranslationUnavailableError, type Lang } from './translate';

type Sql = NeonQueryFunction<false, false>;

export type Group = 'board' | 'team';

export type LeaderRow = {
  id: number;
  lang: Lang;
  grp: Group;
  name: string;
  role: string;
  bio: string;
  photo_id: number | null;
  photo_url: string;
  sort_order: number;
  pair_id: number | null;
};


export const photoSrc = (row: Pick<LeaderRow, 'photo_id' | 'photo_url'>) =>
  row.photo_id ? `/api/media/image/${row.photo_id}` : row.photo_url;

const splitParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** The shape the Leadership page uses (same as the built-in profiles, plus an id). */
export const toLeader = (row: LeaderRow) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  photo: photoSrc(row),
  bio: splitParagraphs(row.bio),
});

export type LeaderInput = {
  lang: Lang;
  grp: Group;
  name: string;
  role: string;
  bio: string;
  sortOrder: number | null;
  photo?: { mime: string; base64: string };
  photoUrl: string;
  translate: boolean;
};

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BASE64 = 5_500_000;

/** Validates an admin create/update request body. */
export function parseLeaderInput(body: Record<string, unknown>): { data: LeaderInput } | { errors: string[] } {
  const str = (k: string, max: number) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const order = Number(body.sortOrder);
  const data: LeaderInput = {
    lang: body.lang === 'ar' ? 'ar' : 'en',
    grp: body.grp === 'team' ? 'team' : 'board',
    name: str('name', 150),
    role: str('role', 200),
    bio: str('bio', 30_000),
    sortOrder: Number.isInteger(order) && order > 0 && order < 1000 ? order : null,
    photoUrl: str('photoUrl', 1000),
    translate: body.translate === true,
  };
  const errors: string[] = [];
  if (body.grp !== 'board' && body.grp !== 'team') errors.push('grp');
  if (!data.name) errors.push('name');
  if (!data.role) errors.push('role');
  if (data.photoUrl && !/^https?:\/\//i.test(data.photoUrl)) errors.push('photoUrl');

  const img = body.photo as { mime?: unknown; base64?: unknown } | undefined;
  if (img && typeof img === 'object') {
    const mime = typeof img.mime === 'string' ? img.mime : '';
    const base64 = typeof img.base64 === 'string' ? img.base64.replace(/^data:[^,]+,/, '') : '';
    if (!ALLOWED_MIME.includes(mime) || !base64 || base64.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
      errors.push('photo');
    } else {
      data.photo = { mime, base64 };
    }
  }
  return errors.length ? { errors } : { data };
}

/** Next free position at the end of a section. */
export async function nextSortOrder(sql: Sql, lang: Lang, grp: Group) {
  const [row] = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM leaders WHERE lang = ${lang} AND grp = ${grp}`;
  return Number(row.next);
}

/**
 * Translates leader `sourceId` into the other language and writes it into its pair (creating the
 * pair when missing). Section, position and photo are copied so both languages stay in step.
 */
export async function syncLeaderTranslation(sql: Sql, sourceId: number): Promise<TranslationResult> {
  const [src] = (await sql`
    SELECT id, lang, grp, name, role, bio, photo_id, photo_url, sort_order, pair_id
    FROM leaders WHERE id = ${sourceId}`) as LeaderRow[];
  if (!src) return { status: 'failed', message: 'Profile not found' };

  let t;
  try {
    // Reuses the post translator: badge = job title, title = name, body = bio.
    t = await translatePost({ badge: src.role, title: src.name, body: src.bio || src.role }, src.lang, 'profile');
  } catch (e) {
    if (e instanceof TranslationUnavailableError) {
      return { status: 'unavailable', message: 'Auto-translation is not set up yet: add GEMINI_API_KEY to the environment.' };
    }
    return { status: 'failed', message: e instanceof Error ? e.message : 'Translation failed' };
  }
  const lang = otherLang(src.lang);
  const bio = src.bio ? t.body : '';

  if (src.pair_id) {
    const [old] = (await sql`SELECT photo_id FROM leaders WHERE id = ${src.pair_id}`) as Pick<LeaderRow, 'photo_id'>[];
    if (old) {
      await sql`
        UPDATE leaders
        SET name = ${t.title}, role = ${t.badge}, bio = ${bio}, grp = ${src.grp}, sort_order = ${src.sort_order},
            photo_id = ${src.photo_id}, photo_url = ${src.photo_url}, updated_at = now()
        WHERE id = ${src.pair_id}`;
      if (old.photo_id !== src.photo_id) await deleteImageIfUnused(sql, old.photo_id);
      return { status: 'updated', id: src.pair_id, publicId: String(src.pair_id), lang };
    }
  }

  const [row] = (await sql`
    INSERT INTO leaders (lang, grp, name, role, bio, photo_id, photo_url, sort_order, pair_id)
    VALUES (${lang}, ${src.grp}, ${t.title}, ${t.badge}, ${bio}, ${src.photo_id}, ${src.photo_url}, ${src.sort_order}, ${src.id})
    RETURNING id`) as Pick<LeaderRow, 'id'>[];
  await sql`UPDATE leaders SET pair_id = ${row.id} WHERE id = ${src.id}`;
  return { status: 'created', id: row.id, publicId: String(row.id), lang };
}

/**
 * Renumbers every section to 1, 2, 3… (per language), keeping the current order. `exclude` rows
 * are left untouched; this is used to take a person out of the order before re-inserting them.
 */
export async function compactOrder(sql: Sql, exclude: number[] = []) {
  const ids = exclude.length ? exclude : [0];
  await sql`
    UPDATE leaders l SET sort_order = r.rn
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY lang, grp ORDER BY sort_order, id) AS rn
      FROM leaders WHERE NOT (id = ANY(${ids}))
    ) r
    WHERE l.id = r.id AND l.sort_order <> r.rn`;
}

/**
 * Frees position `n` in a section (both languages, so a person and their translation stay level)
 * by moving everyone at `n` or later down one place. Call compactOrder(exclude) first.
 */
export async function makeRoom(sql: Sql, grp: Group, n: number, exclude: number[] = []) {
  const ids = exclude.length ? exclude : [0];
  await sql`UPDATE leaders SET sort_order = sort_order + 1 WHERE grp = ${grp} AND sort_order >= ${n} AND NOT (id = ANY(${ids}))`;
}
