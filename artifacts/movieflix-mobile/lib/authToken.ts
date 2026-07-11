/**
 * Module-level auth token store.
 * setAuthTokenGetter is initialized in app/_layout.tsx.
 * AuthContext calls setAuthToken when the user logs in/out.
 */

let _token: string | null = null;

export function getAuthToken(): string | null {
  return _token;
}

export function setAuthToken(token: string | null): void {
  _token = token;
}
