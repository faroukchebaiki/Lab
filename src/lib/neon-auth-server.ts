import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import type { NeonAuth } from "@neondatabase/auth/next/server";

function getCookieSecret() {
  const explicitSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  const fallbackSecret = process.env.AUTH_SECRET?.trim();

  return explicitSecret || fallbackSecret || "replace-this-with-a-long-random-secret";
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: getCookieSecret(),
  },
});

type SessionResult = Awaited<ReturnType<NeonAuth["getSession"]>>;
type TokenResult = Awaited<ReturnType<NeonAuth["token"]>>;

export async function safeGetSession(): Promise<SessionResult> {
  try {
    return await auth.getSession();
  } catch {
    return { data: null, error: null };
  }
}

export async function safeGetToken(): Promise<TokenResult | null> {
  try {
    return await auth.token();
  } catch {
    return null;
  }
}
