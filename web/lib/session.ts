export const SESSION_COOKIE_NAME = "adm_session";

function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function getUserIdFromRequest(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  const userId = cookies[SESSION_COOKIE_NAME];
  return userId && userId.length > 0 ? userId : null;
}

export function makeSessionCookieValue(userId: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 7;
  const secure = process.env.NODE_ENV === "production";
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(userId)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
    secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

export function makeClearSessionCookieValue() {
  const secure = process.env.NODE_ENV === "production";
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}
