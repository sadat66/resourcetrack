import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "sid";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSession(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [payload, sig] = decoded.split(/\.(?=[^.]+$)/);
    if (!payload || !sig || sign(payload) !== sig) return null;
    const [userId] = payload.split(".");
    return userId || null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  return token ? verifySession(token) : null;
}

export function getSessionCookie(userId: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: createSession(userId),
    options: { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" },
  };
}
