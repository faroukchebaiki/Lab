import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  isValidCredentials,
} from "@/lib/session";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a username and password." },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  if (!isValidCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}
