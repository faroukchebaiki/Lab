# Lab App

Internal laboratory reporting app built with Next.js, Neon Auth, and the Neon Data API.

The app provides:
- email/password authentication with email verification
- password reset by email link
- a protected dashboard for creating daily lab reports
- printable report views
- report persistence in Neon Data API, with a local file fallback when the Data API is not configured

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Neon Auth
- Neon Data API
- Zod

## Features

- Sign up with confirmation email
- Sign in with email and password
- Resend verification email when an account is not yet confirmed
- Forgot password and reset-password email flow
- Create `cao-horizontal` reports
- Create `hydration` reports
- View saved reports and open individual printable report pages

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in the values:

```env
AUTH_SECRET=
NEON_AUTH_COOKIE_SECRET=
NEON_AUTH_BASE_URL=
NEON_DATA_API_URL=
NEON_DATA_API_KEY=
```

Notes:
- `AUTH_SECRET` is required for signed auth/session cookies.
- `NEON_AUTH_COOKIE_SECRET` should be a different random secret from `AUTH_SECRET`.
- `NEON_AUTH_BASE_URL` comes from Neon Auth in your Neon dashboard.
- `NEON_DATA_API_URL` comes from the branch Data API page in Neon.
- `NEON_DATA_API_KEY` is optional. If omitted, the app will try to use the signed-in Neon Auth access token for Data API requests.

Generate secrets with Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Neon Setup

### 1. Configure Neon Auth

In the Neon dashboard:
- enable email/password authentication
- configure an email provider so verification and reset emails can be sent
- make sure email verification is enabled if you want new accounts to confirm their email before login

This app expects Neon to handle:
- account creation
- email verification links
- password reset links

### 2. Configure the Data API

This app reads and writes reports through the Neon Data API when `NEON_DATA_API_URL` is present.

Create a `flash_reports` table in Neon before using the dashboard. The app expects at least these columns:

```sql
create table if not exists flash_reports (
  id text primary key,
  type text not null,
  report_date text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  created_by text not null,
  payload jsonb not null
);
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
pnpm lint
pnpm build
```

## Auth Routes

The app uses a catch-all auth route at `src/app/auth/[...path]/page.tsx`.

Supported paths:
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`

## Storage Behavior

Report storage is implemented in [`src/lib/storage.ts`](./src/lib/storage.ts).

Behavior:
- if `NEON_DATA_API_URL` is configured, the app uses Neon Data API
- if Data API is not configured, the app falls back to `data/flash-journal-records.json`
- if Data API is configured but credentials are missing, server requests will fail with an explicit error

## Report Types

Schema definitions live in [`src/lib/report-schema.ts`](./src/lib/report-schema.ts).

Supported report types:
- `cao-horizontal`
- `hydration`

## Project Structure

```text
src/app/
  api/
    auth/[...path]/route.ts
    reports/route.ts
  auth/[...path]/page.tsx
  dashboard/page.tsx
  reports/[id]/page.tsx

src/components/
  dashboard-shell.tsx
  login-form.tsx
  reports/
  ui/

src/lib/
  neon-auth-client.ts
  neon-auth-server.ts
  report-schema.ts
  storage.ts
```

## Important Notes

- Verification and reset emails depend on your Neon Auth email provider being configured correctly.
- `NEON_DATA_API_KEY` increases backend access scope. Only use it if you need server-side fallback access.
- `.env.local` should never be committed.

## License

See [LICENSE](./LICENSE).
