// Server-only module: import it from +api.ts files only, never from screens.
//
// One admin account, configured with environment variables. The defaults are dummy
// credentials for local development; set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SECRET
// in production (e.g. Vercel → Settings → Environment Variables).

const DEFAULT_EMAIL = 'admin@mubadalabio.ae';
const DEFAULT_PASSWORD = 'Admin@123';
const SESSION_HOURS = 12;

const adminEmail = () => (process.env.ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
const adminPassword = () => process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;

function secret() {
  const s = process.env.ADMIN_SECRET ?? process.env.DATABASE_URL;
  if (!s) throw new Error('ADMIN_SECRET (or DATABASE_URL) must be set to sign admin sessions');
  return s;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string) {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'));
}

async function sign(data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data))));
}

/** Compares two strings in time independent of where they differ. */
function safeEqual(a: string, b: string) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function checkCredentials(email: string, password: string) {
  // Evaluate both so a wrong email and a wrong password take the same time.
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail());
  const passwordOk = safeEqual(password, adminPassword());
  return emailOk && passwordOk;
}

/** Returns a signed session token: base64url(payload).signature */
export async function createSession() {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ sub: adminEmail(), exp: Date.now() + SESSION_HOURS * 3600_000 })),
  );
  return `${payload}.${await sign(payload)}`;
}

/** True when the request carries a valid, unexpired admin token. */
export async function isAdmin(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, await sign(payload))) return false;
  try {
    const { sub, exp } = JSON.parse(fromBase64Url(payload));
    return sub === adminEmail() && typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 });
