import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

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
