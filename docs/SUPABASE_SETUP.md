# Supabase Setup For Spectra Calculator

Project:

- Supabase project ref: `gmluepisjslxowncdxba`
- App domain target: `calculatorapp.spectramsia.com`

## 1. Create Database Tables

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

- Enable email/password sign-in.
- Add the deployed PWA URL to allowed redirect/site URLs:
  - `https://calculatorapp.spectramsia.com`
  - local development URL if needed, such as `http://localhost:3000`
- Keep email confirmation on for public beta unless you intentionally want
  instant sign-up.

Google OAuth can be added later after email/password sync is stable.

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

The first Next.js cutover keeps calculator data local in the browser. Supabase
cloud sync should be reconnected in the Next app before asking users to rely on
cross-device profile backup.

## 4. Data Model

Cloud sync is opt-in. The current app stores local data first, then users can
sign in and choose to back up this device.

Synced data:

- Personal finance profile
- Saved home/consumer loan scenarios
- Ongoing loans
- App language setting
- Consent and sync event metadata

Do not store NRIC, bank account numbers, card numbers, OTPs, payslips, or
official loan documents.

## 5. Production Reminder

Supabase free is fine for beta, but it does not include the same backup posture
as paid production. Before users depend on cloud sync:

- Keep migrations in git.
- Add export/import for user data.
- Schedule private database backups or upgrade to a paid plan with backups.
- Review privacy policy and Malaysia PDPA obligations.
