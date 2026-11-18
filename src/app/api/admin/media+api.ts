import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';
import { imageSrc, parseMediaInput, publicId, type MediaRow } from '@/server/media';
import { syncTranslation } from '@/server/pairs';

/** Admin: all media posts in both languages, newest first. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const sql = await db();
  const rows = (await sql`
    SELECT id, slug, lang, badge, title, to_char(date, 'YYYY-MM-DD') AS date, body, url, image_id, image_url, pair_id
    FROM media_posts
    ORDER BY date DESC, id DESC`) as MediaRow[];
  return Response.json({
    posts: rows.map((r) => ({ ...r, publicId: publicId(r), image: imageSrc(r) })),
  });
}

/** Admin: create a media post. */
export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid JSON' }, { status: 400 });

  const parsed = parseMediaInput(body);
  if ('errors' in parsed) return Response.json({ error: 'Invalid fields', fields: parsed.errors }, { status: 400 });
  const d = parsed.data;
  if (!d.image && !d.imageUrl) return Response.json({ error: 'An image is required', fields: ['image'] }, { status: 400 });

  const sql = await db();
  let imageId: number | null = null;
  if (d.image) {
    const [img] = await sql`
      INSERT INTO media_images (mime, data) VALUES (${d.image.mime}, decode(${d.image.base64}, 'base64')) RETURNING id`;
    imageId = img.id;
  }
  const [row] = (await sql`
    INSERT INTO media_posts (lang, badge, title, date, body, url, image_id, image_url)
    VALUES (${d.lang}, ${d.badge}, ${d.title}, ${d.date}, ${d.body}, ${d.url}, ${imageId}, ${imageId ? '' : d.imageUrl})
    RETURNING id, title, slug`) as Pick<MediaRow, 'id' | 'title' | 'slug'>[];
  const translation = d.translate ? await syncTranslation(sql, row.id) : null;
  return Response.json({ ok: true, id: row.id, publicId: publicId(row), translation }, { status: 201 });
}
