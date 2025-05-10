/**
 * Reads a cookie by name
 */
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}

/**
 * Sets a cookie with optional expiry in seconds
 */
export function setCookie(
  name: string,
  value: string,
  expiresInSeconds?: number
): void {
  let cookie = `${name}=${value}; path=/; SameSite=Lax`;
  if (expiresInSeconds) {
    const expiryDate = new Date(Date.now() + expiresInSeconds * 1000);
    cookie += `; expires=${expiryDate.toUTCString()}`;
  }
  document.cookie = cookie;
}

/**
 * Deletes a cookie by name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
