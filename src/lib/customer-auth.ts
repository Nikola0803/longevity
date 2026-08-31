import "server-only";
import crypto from "crypto";

/**
 * Storefront customer sessions. Deliberately simple (signed, expiring
 * token; no DB session table) — mirrors the contract the old nvr-account
 * WordPress plugin exposed (POST /login, /register, /me all returning
 * { token }), so the frontend's account pages needed almost no changes,
 * just a new backend to call.
 */
const SECRET = process.env.NEXTAUTH_SECRET ?? process.env.WEBHOOK_SIGNING_SECRET ?? "dev-only-insecure-secret";
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createCustomerToken(customerId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${customerId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyCustomerToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [customerId, expStr, sig] = decoded.split(".");
    if (!customerId || !expStr || !sig) return null;
    const payload = `${customerId}.${expStr}`;
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return null;
    }
    if (Date.now() > Number(expStr)) return null;
    return customerId;
  } catch {
    return null;
  }
}
