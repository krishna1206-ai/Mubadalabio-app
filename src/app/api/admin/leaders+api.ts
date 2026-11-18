import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';
import {
  compactOrder,
  makeRoom,
  nextSortOrder,
  parseLeaderInput,
  photoSrc,
  syncLeaderTranslation,
  type LeaderRow,
} from '@/server/leaders';

/** Admin: every profile in both languages, by section and position. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const sql = await db();
  const rows = (await sql`
    SELECT id, lang, grp, name, role, bio, photo_id, photo_url, sort_order, pair_id
    FROM leaders
    ORDER BY grp, sort_order, lang, id`) as LeaderRow[];
  return Response.json({ leaders: rows.map((r) => ({ ...r, photo: photoSrc(r) })) });
}

/** Admin: add a profile (and, with `translate`, its other-language version). */
export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid JSON' }, { status: 400 });

  const parsed = parseLeaderInput(body);
  if ('errors' in parsed) return Response.json({ error: 'Invalid fields', fields: parsed.errors }, { status: 400 });
  const d = parsed.data;
  if (!d.photo && !d.photoUrl) return Response.json({ error: 'A photo is required', fields: ['photo'] }, { status: 400 });

  const sql = await db();
  let photoId: number | null = null;
  if (d.photo) {
    const [img] = await sql`
      INSERT INTO media_images (mime, data) VALUES (${d.photo.mime}, decode(${d.photo.base64}, 'base64')) RETURNING id`;
    photoId = img.id;
  }
  // A chosen position pushes everyone from there on down one place; otherwise add at the end.
  let order: number;
  if (d.sortOrder) {
    await compactOrder(sql);
    await makeRoom(sql, d.grp, d.sortOrder);
    order = d.sortOrder;
  } else {
    order = await nextSortOrder(sql, d.lang, d.grp);
  }
  const [row] = (await sql`
    INSERT INTO leaders (lang, grp, name, role, bio, photo_id, photo_url, sort_order)
    VALUES (${d.lang}, ${d.grp}, ${d.name}, ${d.role}, ${d.bio}, ${photoId}, ${photoId ? '' : d.photoUrl}, ${order})
    RETURNING id`) as Pick<LeaderRow, 'id'>[];

  const translation = d.translate ? await syncLeaderTranslation(sql, row.id) : null;
  await compactOrder(sql);
  return Response.json({ ok: true, id: row.id, translation }, { status: 201 });
}
