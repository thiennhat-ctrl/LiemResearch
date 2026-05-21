export type AppRole = 'user' | 'admin';

export interface AuthSession {
  role: AppRole;
  email?: string;
}

const STORAGE_KEY = 'liemresearch.auth.session';

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const role = (parsed as { role?: unknown }).role;
    const email = (parsed as { email?: unknown }).email;

    if (role !== 'user' && role !== 'admin') return null;
    if (email != null && typeof email !== 'string') return null;

    return { role, email };
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
