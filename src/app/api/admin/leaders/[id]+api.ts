import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';
import { compactOrder, makeRoom, parseLeaderInput, syncLeaderTranslation, type LeaderRow } from '@/server/leaders';
import { deleteImageIfUnused } from '@/server/pairs';

const parseId = (id: string) => (/^\d+$/.test(id) ? Number(id) : null);
const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

/** Admin: update a profile. Without a new photo or photo URL, the current photo is kept. */
export async function PUT(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const leaderId = parseId(id);
  if (leaderId === null) return notFound();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const parsed = parseLeaderInput(body);
  if ('errors' in parsed) return Response.json({ error: 'Invalid fields', fields: parsed.errors }, { status: 400 });
  const d = parsed.data;

  const sql = await db();
  const [current] = (await sql`
    SELECT grp, photo_id, photo_url, sort_order, pair_id FROM leaders WHERE id = ${leaderId}`) as Pick<
    LeaderRow,
    'grp' | 'photo_id' | 'photo_url' | 'sort_order' | 'pair_id'
  >[];
  if (!current) return notFound();

  // Moving to another position or section: take this person (and their translation) out of the
  // order, make room at the new place, and put them both there.
  let order = current.sort_order;
  const moved = d.sortOrder !== null && (d.sortOrder !== current.sort_order || d.grp !== current.grp);
  if (moved && d.sortOrder !== null) {
    const pair = current.pair_id ? [leaderId, current.pair_id] : [leaderId];
    await compactOrder(sql, pair);
    await makeRoom(sql, d.grp, d.sortOrder, pair);
    order = d.sortOrder;
    if (current.pair_id) {
      await sql`UPDATE leaders SET grp = ${d.grp}, sort_order = ${order} WHERE id = ${current.pair_id}`;
    }
  }

  let photoId = current.photo_id;
  let photoUrl = current.photo_url;
  if (d.photo) {
    const [img] = await sql`
      INSERT INTO media_images (mime, data) VALUES (${d.photo.mime}, decode(${d.photo.base64}, 'base64')) RETURNING id`;
    photoId = img.id;
    photoUrl = '';
  } else if (d.photoUrl) {
    photoId = null;
    photoUrl = d.photoUrl;
  }

  await sql`
    UPDATE leaders
    SET lang = ${d.lang}, grp = ${d.grp}, name = ${d.name}, role = ${d.role}, bio = ${d.bio},
        photo_id = ${photoId}, photo_url = ${photoUrl}, sort_order = ${order},
        updated_at = now()
    WHERE id = ${leaderId}`;
  if (current.photo_id !== photoId) await deleteImageIfUnused(sql, current.photo_id);

  const translation = d.translate ? await syncLeaderTranslation(sql, leaderId) : null;
  await compactOrder(sql);
  return Response.json({ ok: true, id: leaderId, translation });
}

/** Admin: delete a profile (its other-language version stays), and its photo if now unused. */
export async function DELETE(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const leaderId = parseId(id);
  if (leaderId === null) return notFound();

  const sql = await db();
  const [row] = await sql`DELETE FROM leaders WHERE id = ${leaderId} RETURNING photo_id`;
  if (!row) return notFound();
  await deleteImageIfUnused(sql, row.photo_id);
  await compactOrder(sql); // close the gap
  return Response.json({ ok: true });
}
