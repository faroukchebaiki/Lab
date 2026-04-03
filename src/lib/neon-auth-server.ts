import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

function getCookieSecret() {
  return (
    process.env.NEON_AUTH_COOKIE_SECRET ??
    process.env.AUTH_SECRET ??
    "replace-this-with-a-long-random-secret"
  );
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: getCookieSecret(),
  },
});
