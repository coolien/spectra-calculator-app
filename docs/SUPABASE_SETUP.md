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

The Flutter app must only use the public publishable key. Never put the service role
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

## 3. Flutter Build Defines

Local build:

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\app"
flutter build web --release --base-href / `
  --dart-define=SUPABASE_URL=https://gmluepisjslxowncdxba.supabase.co `
  --dart-define=SUPABASE_PUBLISHABLE_KEY=your-publishable-key
dart run tools/copy_web_pwa_assets.dart
```

Cloudflare Pages build command:

```bash
flutter build web --release --base-href / --dart-define=SUPABASE_URL=https://gmluepisjslxowncdxba.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY && dart run tools/copy_web_pwa_assets.dart
```

Cloudflare Pages environment variable:

- `SUPABASE_PUBLISHABLE_KEY`: paste the Supabase project publishable public key.

Output directory:

```text
build/web
```

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
