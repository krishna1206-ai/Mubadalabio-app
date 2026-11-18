import { checkCredentials, createSession } from '@/server/auth';

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!checkCredentials(email, password)) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  return Response.json({ token: await createSession() });
}
