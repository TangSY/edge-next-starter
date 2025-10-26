# Quick Start

Welcome to the Next.js + Cloudflare full‑stack starter! Follow these steps to get up and running quickly.

## 📦 Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd cloudflare-worker-template
```

### 2. Install Node.js

Use nvm to install the recommended Node.js version:

```bash
nvm install
nvm use
```

### 3. Install pnpm

```bash
npm install -g pnpm
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
cp .dev.vars.example .dev.vars
```

### 6. Login to Cloudflare

```bash
npx wrangler login
```

## ☁️ Cloudflare Resources

Wrangler mocks D1, R2, and KV in local dev, so no remote resources are required. For test or production, use the scripts below.

### Create D1 database (remote)

```bash
# Test
pnpm run db:create:test

# Production
pnpm run db:create:prod
```

Write the `database_id` output into `wrangler.test.toml` or `wrangler.prod.toml`.

### Create R2 bucket (remote)

> ⚠️ **Important**: R2 must be manually enabled in the Cloudflare Dashboard before creating buckets.
>
> Enable R2:
>
> 1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
> 2. Select your account
> 3. Click `R2` in the left sidebar
> 4. Click `Enable R2` or `Purchase R2`
>
> After enabling, run:

```bash
# Test
pnpm run r2:create:test

# Production
pnpm run r2:create:prod
```

### Create KV namespace (remote)

```bash
# Test
pnpm run kv:create:test

# Production
pnpm run kv:create:prod
```

Add the resulting IDs to `[[kv_namespaces]]` in the respective `wrangler.*.toml` files.

## 🗄️ Initialize the database

### Run migrations

```bash
pnpm run db:migrate:local
```

### Seed test data (optional)

```bash
pnpm run db:seed -- --env=local
```

## 🚀 Start the dev server

### Option A: Next.js dev mode (fast iteration)

```bash
pnpm dev
```

Visit http://localhost:3000

Note: Cloudflare bindings (D1, R2, KV) are not available in this mode.

### Option B: Cloudflare full mode (recommended)

```bash
# Build first
pnpm build
pnpm run pages:build

# Start Cloudflare dev server
pnpm run cf:dev
```

Visit http://localhost:8788

Recommended for testing Cloudflare features, DB operations, file uploads, etc.

## ✅ Verify setup

### Test API endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# User list
curl http://localhost:3000/api/users
```

### Run tests

```bash
pnpm test
```

Runs Vitest tests covering DB, cache, R2 client, and repositories.

## 🔧 FAQs

### npm install fails

This project enforces pnpm:

```bash
pnpm install
```

### Cloudflare bindings unavailable

Use `pnpm run cf:dev` instead of `pnpm dev`.

### Database not found

Run migrations:

```bash
pnpm run db:migrate:local
```

## 📚 Next steps

- See [README.md](./README.md) for full features
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for dev workflow
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment

## 💡 Tips

1. Use `pnpm dev` for fast UI work
2. Use `pnpm run cf:dev` to test Cloudflare features
3. Run `pnpm test` before commit
4. Linting and formatting run automatically

---

You’re ready — happy building! 🚀
