# Environment Configuration

This document summarizes core configuration across local, test, and production environments, including binding names, deploy branches, and required secrets.

## Environments Overview

| Environment | Config file          | Database name                      | R2 binding | KV binding | Branch                | Key command                  |
| ----------- | -------------------- | ---------------------------------- | ---------- | ---------- | --------------------- | ---------------------------- |
| Local dev   | `wrangler.toml`      | `cloudflare-worker-template-local` | `BUCKET`   | `KV`       | manual                | `pnpm run cf:dev`            |
| Test        | `wrangler.test.toml` | `cloudflare-worker-template-test`  | `BUCKET`   | `KV`       | `develop` / `preview` | `pnpm run pages:deploy:test` |
| Production  | `wrangler.prod.toml` | `cloudflare-worker-template-prod`  | `BUCKET`   | `KV`       | `main`                | `pnpm run pages:deploy:prod` |

> 📌 Note: Cloudflare Pages and Workers inject env vars based on bindings in `wrangler.*.toml`. Code reads `process.env.BUCKET`, `process.env.DB`, and `process.env.KV`. Keep names consistent.

## Required Secrets

Define the following secrets in repository **Settings → Secrets and variables → Actions** so that CI/CD workflows can create databases, run migrations, and deploy pages:

| Name                                        | Purpose                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`                      | Authorize Wrangler to create/migrate D1, R2, KV and deploy Pages  |
| `CLOUDFLARE_ACCOUNT_ID`                     | Identify the Cloudflare account for Wrangler API calls            |
| `NEXTAUTH_SECRET`                           | Required by NextAuth JWT sessions (set via `wrangler secret put`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials used by NextAuth (must be set together)  |

Add extra third‑party secrets here and reference them in `[vars]` of `wrangler.*.toml`. For Google OAuth, remember Cloudflare Pages separates Preview/Production environments—configure both Client ID/Secret pairs accordingly.

### NEXTAUTH_SECRET Configuration

The `NEXTAUTH_SECRET` is a critical security key used by NextAuth.js to encrypt and sign JWT tokens. Proper configuration is essential for authentication security.

#### Generating a Secure Secret

Use one of the following methods to generate a cryptographically secure random secret:

```bash
# Method 1: OpenSSL (Recommended)
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online Generator
# Visit https://generate-secret.vercel.app/32
```

#### Configuration by Environment

**Local Development:**

- Use the default value `dev-secret` in `.env.local`
- Security validation is relaxed for local development
- **Never use this default value in production**

**CI/CD Builds:**

- CI builds automatically skip NEXTAUTH_SECRET validation
- The build process uses `CI=true` flag to allow default values during compilation
- Runtime validation still enforces production requirements

**Test/Production Deployment (Cloudflare Pages):**

1. Generate a unique secret key using one of the methods above
2. Configure in Cloudflare Pages Dashboard:
   - Navigate to your Pages project
   - Go to `Settings` → `Environment variables`
   - Add variable:
     - **Name**: `NEXTAUTH_SECRET`
     - **Value**: (paste your generated secret)
     - **Environment**: Select `Production` and/or `Preview` as needed

**Security Best Practices:**

- ✅ Generate a unique secret for each environment (test, production)
- ✅ Store secrets in environment variables, never in code
- ✅ Use at least 32 bytes (256 bits) of randomness
- ✅ Rotate secrets periodically for enhanced security
- ❌ Never commit the actual secret to version control
- ❌ Never share secrets between different projects
- ❌ Never use the default `dev-secret` value in production

**Validation Behavior:**

The application validates `NEXTAUTH_SECRET` based on the runtime environment:

- **Development** (`NODE_ENV=development`): Accepts default value
- **CI Builds** (`CI=true`): Skips validation during build phase
- **Production Runtime** (`NODE_ENV=production`, not CI): Requires a non-default secure value, will throw an error if default is detected

**Troubleshooting:**

If you see the error "NEXTAUTH_SECRET must be configured for production environments":

1. Ensure you've set `NEXTAUTH_SECRET` in Cloudflare Pages environment variables
2. Verify the environment variable is set for the correct environment (Production/Preview)
3. Check that you're not using the default `dev-secret` value
4. Redeploy your application after updating the environment variable

## Bindings Checklist

- D1: Confirm `database_name` matches the table; remote environments require real `database_id`.
- R2: Binding must be `BUCKET`, otherwise `createR2Client()` returns `null`.
- KV: Binding must be `KV`, consistent with cache client.
- Vars: Set optional `ENVIRONMENT`, `RATE_LIMIT_*`, `LOG_LEVEL` in `[vars]`.

## Analytics Backend Selection (fallbacks)

Select the Analytics event sink backend via environment variables:

- `ANALYTICS_ENABLED`: `true|false` (default `true`)
- `ANALYTICS_SINK`: `log|kv|d1|engine` (default `log`)

Recommendations:

- Dev/Test: `ANALYTICS_SINK=log` (or `kv` for lightweight counts)
- Production: prefer `engine`; on failure fallback to logs. For structured retention, `d1` with migration tables.

Notes:

- `kv` mode only accumulates counts per event type + date
- `engine` mode requires a binding; without it, falls back to logs

## Analytics Engine Binding Example (production)

Add Analytics Engine dataset binding in `wrangler.prod.toml` and select `engine` as the backend in environment variables:

```toml
[vars]
ENVIRONMENT = "production"
ANALYTICS_SINK = "engine"

[[analytics_engine_datasets]]
binding = "ANALYTICS"                 # Code accesses via env.ANALYTICS
dataset = "your-analytics-dataset"    # Replace with actual dataset name
```

Code retrieves binding via `getAnalyticsEngine()`:

```ts
import { getAnalyticsEngine } from '@/lib/analytics';

const engine = getAnalyticsEngine();
await engine?.writeDataPoint({
  blobs: [
    /* string columns */
  ],
  doubles: [
    /* numeric columns */
  ],
  indexes: [
    /* index columns */
  ],
});
```

Note: Without binding or on write failure, system falls back to logs.

## Data Initialization

Use the script `scripts/seed.js` to inject sample data into the database:

```bash
# Local (Wrangler uses local SQLite file)
pnpm run db:seed -- --env=local

# Test environment (requires remote database and Cloudflare credentials)
pnpm run db:seed -- --env=test

# Production environment (use with caution)
pnpm run db:seed -- --env=prod
```

The script auto‑matches DB name and args; unsupported env exits with a message.

## Pre‑Deployment Checks

1. `pnpm test && pnpm run type-check && pnpm run format:check`
2. Did local or remote migration commands (`pnpm run db:migrate:local`) succeed?
3. Are all Cloudflare bindings created in the Dashboard?
4. Are secrets configured?
5. Are versions and CHANGELOG generated by `release-please` as expected?

Keep this checklist current to help contributors and ops onboard and troubleshoot.
