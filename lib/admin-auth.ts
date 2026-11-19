import { createHash, timingSafeEqual } from "node:crypto";

/** Admin-Basic-Auth für Route-Handler: fail-closed (ohne ADMIN_PASSWORD immer false),
 *  zeitkonstanter Vergleich, Passwort darf ':' enthalten. */
export function isAdminRequest(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  const password = decoded.slice(i + 1);
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(password), h(adminPassword));
}
