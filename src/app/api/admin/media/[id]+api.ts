import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';
import { parseMediaInput, publicId, type MediaRow } from '@/server/media';
import { deleteImageIfUnused, syncTranslation } from '@/server/pairs';

const parseId = (id: string) => (/^\d+$/.test(id) ? Number(id) : null);
const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

/** Admin: update a media post. Without a new image or image URL, the current image is kept. */
export async function PUT(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const postId = parseId(id);
  if (postId === null) return notFound();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const parsed = parseMediaInput(body);
  if ('errors' in parsed) return Response.json({ error: 'Invalid fields', fields: parsed.errors }, { status: 400 });
  const d = parsed.data;

  const sql = await db();
  const [current] = (await sql`SELECT image_id, image_url FROM media_posts WHERE id = ${postId}`) as Pick<
    MediaRow,
    'image_id' | 'image_url'
  >[];
  if (!current) return notFound();

  let imageId = current.image_id;
  let imageUrl = current.image_url;
  if (d.image) {
    const [img] = await sql`
      INSERT INTO media_images (mime, data) VALUES (${d.image.mime}, decode(${d.image.base64}, 'base64')) RETURNING id`;
    imageId = img.id;
    imageUrl = '';
  } else if (d.imageUrl) {
    imageId = null;
    imageUrl = d.imageUrl;
  }

  const [row] = (await sql`
    UPDATE media_posts
    SET slug = CASE WHEN lang = ${d.lang} THEN slug ELSE NULL END, -- the other language may use the same slug
        lang = ${d.lang}, badge = ${d.badge}, title = ${d.title}, date = ${d.date}, body = ${d.body},
        url = ${d.url}, image_id = ${imageId}, image_url = ${imageUrl}, updated_at = now()
    WHERE id = ${postId}
    RETURNING id, title, slug`) as Pick<MediaRow, 'id' | 'title' | 'slug'>[];

  // Remove the replaced upload once nothing uses it (a translated pair may share it).
  if (current.image_id !== imageId) await deleteImageIfUnused(sql, current.image_id);

  const translation = d.translate ? await syncTranslation(sql, row.id) : null;
  return Response.json({ ok: true, id: row.id, publicId: publicId(row), translation });
}

/** Admin: delete a media post together with its other-language version, and their image if unused. */
export async function DELETE(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const postId = parseId(id);
  if (postId === null) return notFound();

  const sql = await db();
  const [post] = (await sql`SELECT pair_id FROM media_posts WHERE id = ${postId}`) as { pair_id: number | null }[];
  if (!post) return notFound();
  // The twin is the row this post points to, or any row pointing back at it.
  const rows = (await sql`
    DELETE FROM media_posts
    WHERE id = ${postId} OR id = ${post.pair_id ?? 0} OR pair_id = ${postId}
    RETURNING id, image_id`) as { id: number; image_id: number | null }[];
  for (const imageId of new Set(rows.map((r) => r.image_id))) await deleteImageIfUnused(sql, imageId);
  return Response.json({ ok: true, deleted: rows.map((r) => r.id) });
}
