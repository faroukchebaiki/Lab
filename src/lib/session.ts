import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "flash-journal-session";

const SESSION_DURATION = 60 * 60 * 24 * 30;

type SessionPayload = {
  username: string;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "change-me-in-vercel-and-env-local"
  );
}

export function getExpectedCredentials() {
  return {
    username: process.env.APP_USERNAME ?? "admin",
    password: process.env.APP_PASSWORD ?? "lab2026",
  };
}

export function isValidCredentials(username: string, password: string) {
  const expected = getExpectedCredentials();

  return (
    username.trim() === expected.username.trim() && password === expected.password
  );
}

export async function createSessionToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (typeof payload.username !== "string") {
      return null;
    }

    return {
      username: payload.username,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION,
  };
}
