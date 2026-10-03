// Centralized API utility ensuring seamless authentication across iframes and browsers

export function getStoredUserId(): string | null {
  try {
    return localStorage.getItem('smartcampus_user_id');
  } catch (e) {
    return null;
  }
}

export function setStoredUserId(id: string): void {
  try {
    localStorage.setItem('smartcampus_user_id', id);
  } catch (e) {}
}

export function removeStoredUserId(): void {
  try {
    localStorage.removeItem('smartcampus_user_id');
  } catch (e) {}
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const userId = getStoredUserId();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (userId) {
    headers.set('x-user-id', userId);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}
