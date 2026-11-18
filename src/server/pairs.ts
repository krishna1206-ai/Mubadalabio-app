// Server-only module: keeps a post's other-language version (its "pair") in sync by translation.
import type { NeonQueryFunction } from '@neondatabase/serverless';

import { publicId, type MediaRow } from './media';
import { otherLang, translatePost, TranslationUnavailableError } from './translate';

type Sql = NeonQueryFunction<false, false>;

export type TranslationResult =
  | { status: 'created' | 'updated'; id: number; publicId: string; lang: 'en' | 'ar' }
  | { status: 'unavailable' | 'failed'; message: string };

/** Deletes an uploaded image once nothing uses it (posts, their pairs and leader photos share images). */
export async function deleteImageIfUnused(sql: Sql, imageId: number | null | undefined) {
  if (!imageId) return;
  await sql`
    DELETE FROM media_images
    WHERE id = ${imageId} AND NOT EXISTS (SELECT 1 FROM media_posts WHERE image_id = ${imageId})
      AND NOT EXISTS (SELECT 1 FROM leaders WHERE photo_id = ${imageId})`;
}

/**
 * Translates post `sourceId` into the other language and writes the result into its pair,
 * creating the pair if there is none. Image, date and link are copied from the source.
 * Never throws for translation problems: the source post is already saved, so the caller
 * just reports what happened.
 */
export async function syncTranslation(sql: Sql, sourceId: number): Promise<TranslationResult> {
  const [src] = (await sql`
    SELECT id, slug, lang, badge, title, to_char(date, 'YYYY-MM-DD') AS date, body, url, image_id, image_url, pair_id
    FROM media_posts WHERE id = ${sourceId}`) as MediaRow[];
  if (!src) return { status: 'failed', message: 'Post not found' };

  let t;
  try {
    t = await translatePost(src, src.lang);
  } catch (e) {
    if (e instanceof TranslationUnavailableError) {
      return {
        status: 'unavailable',
        message: 'Auto-translation is not set up yet: add GEMINI_API_KEY to the environment.',
      };
    }
    return { status: 'failed', message: e instanceof Error ? e.message : 'Translation failed' };
  }
  const lang = otherLang(src.lang);

  if (src.pair_id) {
    const [old] = (await sql`SELECT image_id FROM media_posts WHERE id = ${src.pair_id}`) as Pick<MediaRow, 'image_id'>[];
    if (old) {
      const [row] = (await sql`
        UPDATE media_posts
        SET badge = ${t.badge}, title = ${t.title}, body = ${t.body}, date = ${src.date},
            image_id = ${src.image_id}, image_url = ${src.image_url},
            url = CASE WHEN url = '' THEN ${src.url} ELSE url END, -- keep a language-specific link
            updated_at = now()
        WHERE id = ${src.pair_id}
        RETURNING id, title, slug`) as Pick<MediaRow, 'id' | 'title' | 'slug'>[];
      if (old.image_id !== src.image_id) await deleteImageIfUnused(sql, old.image_id);
      return { status: 'updated', id: row.id, publicId: publicId(row), lang };
    }
  }

  const [row] = (await sql`
    INSERT INTO media_posts (lang, badge, title, date, body, url, image_id, image_url, pair_id)
    VALUES (${lang}, ${t.badge}, ${t.title}, ${src.date}, ${t.body}, ${src.url}, ${src.image_id}, ${src.image_url}, ${src.id})
    RETURNING id, title, slug`) as Pick<MediaRow, 'id' | 'title' | 'slug'>[];
  await sql`UPDATE media_posts SET pair_id = ${row.id} WHERE id = ${src.id}`;
  return { status: 'created', id: row.id, publicId: publicId(row), lang };
}
