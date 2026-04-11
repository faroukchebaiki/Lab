import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");
const USER_SETTINGS_FILE = path.join(DATA_DIR, "user-settings.json");

const userProfileSettingsSchema = z.object({
  birthday: z.string().default(""),
  occupation: z.string().default("Chemical Industrial Engineer"),
  department: z.string().default("Production Laboratory"),
  phone: z.string().default(""),
  location: z.string().default(""),
  bio: z.string().default(""),
});

const userSettingsStoreSchema = z.object({
  users: z.record(z.string(), userProfileSettingsSchema).default({}),
});

export type UserProfileSettings = z.infer<typeof userProfileSettingsSchema>;

const defaultUserProfileSettings: UserProfileSettings = {
  birthday: "",
  occupation: "Chemical Industrial Engineer",
  department: "Production Laboratory",
  phone: "",
  location: "",
  bio: "",
};

async function ensureUserSettingsStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(USER_SETTINGS_FILE);
  } catch {
    await fs.writeFile(
      USER_SETTINGS_FILE,
      JSON.stringify({ users: {} }, null, 2),
      "utf8"
    );
  }
}

async function readUserSettingsStore() {
  await ensureUserSettingsStore();
  const raw = await fs.readFile(USER_SETTINGS_FILE, "utf8");
  const parsed = userSettingsStoreSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    return { users: {} };
  }

  return parsed.data;
}

async function writeUserSettingsStore(store: z.infer<typeof userSettingsStoreSchema>) {
  await ensureUserSettingsStore();
  await fs.writeFile(USER_SETTINGS_FILE, JSON.stringify(store, null, 2), "utf8");
}

function normalizeUserKey(userId: string) {
  return userId.trim();
}

export async function getUserProfileSettings(userId: string) {
  const store = await readUserSettingsStore();
  const key = normalizeUserKey(userId);

  return {
    ...defaultUserProfileSettings,
    ...(store.users[key] ?? {}),
  };
}

export async function saveUserProfileSettings(
  userId: string,
  nextSettings: Partial<UserProfileSettings>
) {
  const store = await readUserSettingsStore();
  const key = normalizeUserKey(userId);
  const mergedSettings = userProfileSettingsSchema.parse({
    ...(store.users[key] ?? defaultUserProfileSettings),
    ...nextSettings,
  });

  store.users[key] = mergedSettings;
  await writeUserSettingsStore(store);

  return mergedSettings;
}
