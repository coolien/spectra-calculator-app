# Supabase Setup For Spectra Calculator

Project:

- Supabase project ref: `gmluepisjslxowncdxba`
- App domain target: `calculatorapp.spectramsia.com`

## 1. Create Database Tables

For the current Next.js PWA, run the idempotent migration:

1. `docs/supabase/migrations/20260714_nextjs_cloud_sync.sql`

It creates the shared account profile, versioned consent records, and one atomic
`app_snapshots` row per user for `spectra-calculator`. RLS is enabled and forced,
anonymous table access is revoked, and authenticated users are restricted to
rows where `auth.uid()` matches `user_id`.

The older normalized Flutter schema remains documented for compatibility. A
brand-new database that needs those legacy tables can run these files first:

Open the Supabase SQL Editor and run these files in order:

1. `docs/supabase/schema.sql`
2. `docs/supabase/rls_policies.sql`

The policies keep each user inside their own rows with:

```sql
auth.uid() = user_id
```

The PWA must only use the public publishable key. Never put the service role
key into the app, GitHub, or Cloudflare Pages client bundle.

## 2. Auth Settings

In Supabase Auth settings:

- Keep email sign-in enabled. The PWA uses passwordless magic links.
- Add the deployed PWA URL to allowed redirect/site URLs:
  - `https://calculatorapp.spectramsia.com`
  - local development URL if needed, such as `http://localhost:3000`
- Keep email confirmation enabled.

Google OAuth can be added later after magic-link sync is stable.

## 3. Next.js Environment Variables

Cloudflare Pages project settings can use:

```text
NEXT_PUBLIC_SUPABASE_URL=https://gmluepisjslxowncdxba.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Cloudflare Pages build command:

```bash
npm ci && npm run typecheck && npm run build
```

Output directory:

```text
out
```

The app remains local-first. When a user signs in, the device state is merged
with the user's cloud snapshot and later changes are backed up automatically.

## 4. Data Model

Cloud sync is opt-in. The current app stores local data first, then users can
sign in and choose to back up this device.

The versioned `app_snapshots.payload` stores:

- Personal finance profile
- Saved home/consumer loan scenarios
- Calculator form drafts and last-used calculator
- App language setting

Shared identity and cloud-sync consent are stored separately in `profiles` and
`user_consents`. This gives future Spectra apps a common account boundary while
keeping each app's state isolated by `app_id`.

Do not store NRIC, bank account numbers, card numbers, OTPs, payslips, or
official loan documents.

## 5. Production Reminder

Supabase free is fine for beta, but it does not include the same backup posture
as paid production. Before users depend on cloud sync:

- Keep migrations in git.
- Add export/import for user data.
- Schedule private database backups or upgrade to a paid plan with backups.
- Review privacy policy and Malaysia PDPA obligations.
