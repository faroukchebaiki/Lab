import { NextResponse } from "next/server";

import { safeGetSession } from "@/lib/neon-auth-server";
import { saveUserProfileSettings } from "@/lib/user-settings";

export async function POST(request: Request) {
  const { data: session } = await safeGetSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Invalid settings payload." },
      { status: 400 }
    );
  }

  try {
    const settings = await saveUserProfileSettings(session.user.id, {
      birthday:
        typeof payload.birthday === "string" ? payload.birthday.trim() : "",
      occupation:
        typeof payload.occupation === "string"
          ? payload.occupation.trim()
          : "",
      department:
        typeof payload.department === "string"
          ? payload.department.trim()
          : "",
      phone: typeof payload.phone === "string" ? payload.phone.trim() : "",
      location:
        typeof payload.location === "string" ? payload.location.trim() : "",
      bio: typeof payload.bio === "string" ? payload.bio.trim() : "",
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save your profile settings.",
      },
      { status: 500 }
    );
  }
}
