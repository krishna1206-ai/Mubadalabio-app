import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiUrl } from './api';

export type AdminMessage = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  department: string;
  message: string;
  status: 'new' | 'read';
  created_at: string;
};

const TOKEN_KEY = 'mubadalabio.adminToken';

export class AuthError extends Error {}

export const loadToken = () => AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new AuthError(data.error ?? 'Unauthorized');
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export const login = (email: string, password: string) =>
  request<{ token: string }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const fetchMessages = (token: string) =>
  request<{ messages: AdminMessage[] }>('/api/admin/messages', { token }).then((d) => d.messages);

export const setMessageStatus = (token: string, id: number, status: AdminMessage['status']) =>
  request(`/api/admin/messages/${id}`, { method: 'PATCH', token, body: JSON.stringify({ status }) });

export const deleteMessage = (token: string, id: number) =>
  request(`/api/admin/messages/${id}`, { method: 'DELETE', token });

// ---- Media posts -------------------------------------------------------

export type MediaPost = {
  id: number;
  publicId: string;
  lang: 'en' | 'ar';
  badge: string;
  title: string;
  date: string; // YYYY-MM-DD
  body: string;
  url: string;
  image: string; // '/api/media/image/1' or an external URL
  image_url: string;
  /** The same post in the other language, if any. */
  pair_id: number | null;
};

export type MediaPayload = {
  lang: 'en' | 'ar';
  badge: string;
  title: string;
  date: string;
  body: string;
  url: string;
  imageUrl: string;
  image?: { mime: string; base64: string };
  /** Create or update the other-language version by machine translation. */
  translate: boolean;
};

export type TranslationResult =
  | { status: 'created' | 'updated'; id: number; publicId: string; lang: 'en' | 'ar' }
  | { status: 'unavailable' | 'failed'; message: string };

export type SavedPost = { id: number; publicId: string; translation: TranslationResult | null };

export class FieldError extends Error {
  constructor(public fields: string[]) {
    super('Invalid fields');
  }
}

export const fetchMediaPosts = (token: string) =>
  request<{ posts: MediaPost[] }>('/api/admin/media', { token }).then((d) =>
    d.posts.map((p) => ({ ...p, image: p.image.startsWith('/') ? apiUrl(p.image) : p.image })),
  );

/** Creates the post, or updates it when `id` is given. */
export async function saveMediaPost(token: string, payload: MediaPayload, id?: number) {
  const res = await fetch(apiUrl(id ? `/api/admin/media/${id}` : '/api/admin/media'), {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new AuthError(data.error ?? 'Unauthorized');
  if (res.status === 400 && Array.isArray(data.fields)) throw new FieldError(data.fields);
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as SavedPost;
}

/** Deletes the post and its other-language version; resolves to the ids removed. */
export const deleteMediaPost = (token: string, id: number) =>
  request<{ deleted: number[] }>(`/api/admin/media/${id}`, { method: 'DELETE', token }).then((d) => d.deleted);

// ---- Leadership (Board of Directors / Leadership Team) ---------------------

export type LeaderGroup = 'board' | 'team';

export type AdminLeader = {
  id: number;
  lang: 'en' | 'ar';
  grp: LeaderGroup;
  name: string;
  role: string;
  bio: string;
  photo: string; // '/api/media/image/1' or an external URL
  photo_url: string;
  sort_order: number;
  pair_id: number | null;
};

export type LeaderPayload = {
  lang: 'en' | 'ar';
  grp: LeaderGroup;
  name: string;
  role: string;
  bio: string;
  sortOrder: number | null;
  photoUrl: string;
  photo?: { mime: string; base64: string };
  translate: boolean;
};

export type SavedLeader = { id: number; translation: TranslationResult | null };

export const fetchAdminLeaders = (token: string) =>
  request<{ leaders: AdminLeader[] }>('/api/admin/leaders', { token }).then((d) =>
    d.leaders.map((l) => ({ ...l, photo: l.photo.startsWith('/') ? apiUrl(l.photo) : l.photo })),
  );

/** Creates the profile, or updates it when `id` is given. */
export async function saveLeader(token: string, payload: LeaderPayload, id?: number) {
  const res = await fetch(apiUrl(id ? `/api/admin/leaders/${id}` : '/api/admin/leaders'), {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new AuthError(data.error ?? 'Unauthorized');
  if (res.status === 400 && Array.isArray(data.fields)) throw new FieldError(data.fields);
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as SavedLeader;
}

/** Deletes the profile and its other-language version; resolves to the ids removed. */
export const deleteLeader = (token: string, id: number) =>
  request<{ deleted: number[] }>(`/api/admin/leaders/${id}`, { method: 'DELETE', token }).then((d) => d.deleted);
