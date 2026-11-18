import { db } from '@/server/db';
import { toArticle, type MediaRow } from '@/server/media';

/** Public: all media posts for one language, newest first. GET /api/media?lang=en */
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const sql = await db();
  const rows = (await sql`
    SELECT id, slug, lang, badge, title, to_char(date, 'YYYY-MM-DD') AS date, body, url, image_id, image_url
    FROM media_posts
    WHERE lang = ${lang}
    ORDER BY date DESC, id DESC`) as MediaRow[];
  return Response.json({ articles: rows.map(toArticle) });
}
