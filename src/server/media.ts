// Server-only module: import it from +api.ts files only, never from screens.
import { formatArticleDate } from '@/lib/dates';

export type MediaRow = {
  id: number;
  /** Original link id for imported posts; null for posts created in the admin panel. */
  slug: string | null;
  lang: 'en' | 'ar';
  badge: string;
  title: string;
  date: string; // YYYY-MM-DD
  body: string;
  url: string;
  image_id: number | null;
  image_url: string;
  /** The same post in the other language, if any. */
  pair_id?: number | null;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/** Public id used in /news/<id> links, e.g. "new-partnership-m12". */
export const publicId = (row: Pick<MediaRow, 'id' | 'title' | 'slug'>) => {
  if (row.slug) return row.slug;
  const slug = slugify(row.title);
  return slug ? `${slug}-m${row.id}` : `m${row.id}`;
};

export const imageSrc = (row: Pick<MediaRow, 'image_id' | 'image_url'>) =>
  row.image_id ? `/api/media/image/${row.image_id}` : row.image_url;

/** Shape the app's media screens use (same as the built-in articles, plus badge and isoDate). */
export function toArticle(row: MediaRow) {
  return {
    id: publicId(row),
    title: row.title,
    date: formatArticleDate(row.date, row.lang),
    isoDate: row.date,
    image: imageSrc(row),
    url: row.url,
    badge: row.badge,
    body: row.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  };
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BASE64 = 5_500_000; // ≈4 MB of image, under Vercel's 4.5 MB request limit

export type MediaInput = {
  lang: 'en' | 'ar';
  badge: string;
  title: string;
  date: string;
  body: string;
  url: string;
  /** New uploaded image, as base64. */
  image?: { mime: string; base64: string };
  /** External image address (used when no file is uploaded). */
  imageUrl: string;
  /** Create or update the other-language version by machine translation. */
  translate: boolean;
};

/** Validates an admin create/update request body. */
export function parseMediaInput(body: Record<string, unknown>): { data: MediaInput } | { errors: string[] } {
  const str = (k: string, max: number) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const data: MediaInput = {
    lang: body.lang === 'ar' ? 'ar' : 'en',
    badge: str('badge', 60),
    title: str('title', 300),
    date: str('date', 10),
    body: str('body', 50_000),
    url: str('url', 1000),
    imageUrl: str('imageUrl', 1000),
    translate: body.translate === true,
  };
  const errors: string[] = [];
  if (!data.badge) errors.push('badge');
  if (!data.title) errors.push('title');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) errors.push('date');
  if (!data.body) errors.push('body');
  if (data.url && !/^https?:\/\//i.test(data.url)) errors.push('url');
  if (data.imageUrl && !/^https?:\/\//i.test(data.imageUrl)) errors.push('imageUrl');

  const img = body.image as { mime?: unknown; base64?: unknown } | undefined;
  if (img && typeof img === 'object') {
    const mime = typeof img.mime === 'string' ? img.mime : '';
    const base64 = typeof img.base64 === 'string' ? img.base64.replace(/^data:[^,]+,/, '') : '';
    if (!ALLOWED_MIME.includes(mime) || !base64 || base64.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
      errors.push('image');
    } else {
      data.image = { mime, base64 };
    }
  }
  return errors.length ? { errors } : { data };
}
