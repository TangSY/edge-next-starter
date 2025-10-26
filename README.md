English | [简体中文](./README-zh.md)

---

# Next.js + Cloudflare Full‑Stack Starter

An out‑of‑the‑box Next.js + Cloudflare full‑stack starter integrating Edge Runtime, D1 database, R2 storage, KV cache, Analytics Engine hooks, and a complete CI/CD pipeline.

## ✨ Features

### Core Stack

- **Next.js 15.5.2** — App Router with TypeScript
- **Cloudflare Pages** — Edge Runtime deployment
- **D1 Database** — Edge SQLite database
- **R2 Storage** — Object storage with zero egress fees
- **KV Storage** — High‑performance key‑value cache
- **Analytics Engine** — Event analytics and observability
- **Tailwind CSS** — Utility‑first CSS framework

### Tooling

- **pnpm** — Fast, disk‑efficient package manager
- **Vitest** — Modern unit test framework
- **ESLint + Prettier** — Code quality and formatting
- **TypeScript** — Type safety

### Automation

- ✅ Vitest covers repositories, database, cache, and storage clients
- ✅ Automated CI/CD (with build‑cache optimization)
- ✅ Database migrations auto‑run and verify
- ✅ Multi‑environment configs (dev/test/prod)
- ✅ API rate limit (KV‑based sliding window)
- ✅ Auto‑generate CHANGELOG (Conventional Commits)
- ✅ **Environment variable validation (Zod)**
- ✅ **Structured logs and request tracing (built‑in Analytics hooks; extendable to Analytics Engine)**
- ✅ **Automated migration validation scripts**

## 📋 Requirements

- **Node.js** >= 20.0.0 (recommend `nvm`)
- **pnpm** >= 8.0.0
- **Cloudflare account**
- **Git**

## 🚀 Quick Start

For full setup, see **[Quick Start](./QUICKSTART.md)**. It covers dependencies, Cloudflare login, resource creation, migrations, and dev server. This section provides the entry points only.

## 📁 Project Structure

```
cloudflare-worker-template/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes (Edge Runtime)
│   │   ├── health/           # Health check
│   │   ├── users/            # User CRUD examples
│   │   ├── posts/            # Post CRUD examples
│   │   └── upload/           # File upload example
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── repositories/              # Data access layer (Repository pattern)
│   ├── index.ts              # Repository factory
│   ├── user.repository.ts    # User data ops
│   └── post.repository.ts    # Post data ops
├── lib/                       # Libraries
│   ├── api/                  # API utilities (responses, middleware, DB wrapper)
│   ├── db/                   # D1 client (Prisma singleton)
│   ├── r2/                   # R2 client
│   ├── cache/                # KV cache client
│   ├── errors/               # Unified error handling
│   ├── logger/               # Logging system
│   └── utils/                # Utilities
├── components/                # React components
├── types/                     # TypeScript types
├── migrations/                # Database migrations (SQL)
│   ├── 0001_init.sql         # Initial schema
│   └── 002_example.sql.template
├── prisma/                    # Prisma schema
│   └── schema.prisma         # Models
├── scripts/                   # Automation scripts
│   └── seed.js               # Seed data
├── __tests__/                 # Tests
│   ├── lib/                  # Unit tests
│   └── api/                  # API tests
├── .github/workflows/         # GitHub Actions CI/CD
│   ├── ci.yml                # CI
│   ├── deploy-test.yml       # Test deploy
│   └── deploy-prod.yml       # Prod deploy
├── wrangler.toml              # Local env config
├── wrangler.test.toml         # Test env config
├── wrangler.prod.toml         # Prod env config
├── .nvmrc                     # Node.js version
├── .npmrc                     # pnpm config
├── vitest.config.ts           # Test config
└── package.json               # Project config
```

## 🛠️ Commands

See **[Development Guide](./docs/DEVELOPMENT.md)** for details.

```bash
# Development
pnpm dev                    # Next.js dev server
pnpm run cf:dev             # Cloudflare full‑stack dev

# Testing
pnpm test                   # Run all tests
pnpm run test:watch         # Watch mode

# Build & Deploy
pnpm build                  # Build app
pnpm run pages:deploy       # Deploy to Cloudflare
```

## 🔄 CI/CD

See **[Deployment Guide](./docs/DEPLOYMENT.md)** for details.

- **CI**: On every push — tests, type‑check, build
- **Auto deploy**:
  - `develop` → test
  - `main` → production

### Secrets

Add in repo settings:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 📦 API Examples

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Users (with cache)

```bash
# Get all users
curl https://your-domain.com/api/users

# Create user
curl -X POST https://your-domain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Zhang San"}'
```

### Upload to R2

```bash
# Upload file
curl -X POST https://your-domain.com/api/upload \
  -F "file=@image.jpg"

# Download file
curl https://your-domain.com/api/upload?key=uploads/1234567890-image.jpg
```

## 🧪 Testing

```bash
pnpm test                   # Core unit tests
pnpm run test:coverage      # Coverage report
```

Coverage includes D1, R2, KV, and error handling.

## 🌍 Environments

- **Local**: `wrangler.toml`
- **Test**: `wrangler.test.toml` — auto‑deploy from `develop`
- **Prod**: `wrangler.prod.toml` — auto‑deploy from `main`

Details on binding names, secrets, and seeding: [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## 📈 Cloudflare Workers Free Quotas

Summary under Workers Free plan (subject to official docs):

- Pages
  - Projects (sites): 100
  - Builds per month: 500
  - Concurrent builds: 1
  - Custom domains: 100 per project
  - Bandwidth/static requests: unlimited

- Pages Functions (shares quotas with Workers)
  - Daily requests: 100,000
  - CPU time: 10 ms per request

- D1 Database
  - Databases: 10
  - Total storage: 5 GB (shared)
  - Daily row reads: 5,000,000
  - Daily row writes: 100,000

- R2 Storage
  - Storage: 10 GB per month
  - Class A ops (write/delete): 1,000,000 per month
  - Class B ops (read): 10,000,000 per month
  - Egress: free ($0)

- KV Storage
  - Total storage: 1 GB
  - Daily reads: 10,000,000
  - Daily writes/deletes/lists: 100,000 (combined)

- Analytics Engine
  - Daily data points written: 100,000
  - Daily read queries: 10,000

Tip: For higher quotas or features, upgrade Workers plans. In production, prefer Analytics Engine via feature flags; in dev/test use logs or KV/D1 as fallbacks.

## 💡 Best Practices

See **[Development Guide](./docs/DEVELOPMENT.md)**.

1. **Use pnpm** — enforced by project config
2. **Follow lint rules** — ESLint + Prettier run pre‑commit
3. **Write tests** — add test cases for new features
4. **Use migrations** — manage DB changes with SQL files

## 🔧 FAQs

Troubleshooting docs:

- Dev issues: [Development Guide FAQ](./docs/DEVELOPMENT.md#faq)
- Deploy issues: [Deployment Guide Troubleshooting](./docs/DEPLOYMENT.md#troubleshooting)

## 📚 Docs

### Core

- [QUICKSTART.md](./QUICKSTART.md) — Quick Start
- [CHANGELOG.md](./CHANGELOG.md) — Changelog

### Technical

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) — Development Guide
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Deployment Guide
- [ENVIRONMENTS.md](./docs/ENVIRONMENTS.md) — Environment Bindings & Secrets

### Specialized

- [REPOSITORY.md](./docs/REPOSITORY.md) — Repository Pattern Guide
- [MIGRATIONS.md](./docs/MIGRATIONS.md) — Database Migrations Guide

## 🔗 References

- [Next.js](https://nextjs.org/docs) | [Cloudflare Pages](https://pages.cloudflare.com/)
- [D1 Database](https://developers.cloudflare.com/d1/) | [R2 Storage](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## 🎯 Start Building

After cloning:

1. ✅ Complete setup via [Quick Start](./QUICKSTART.md)
2. ✅ Build pages and APIs under `app/`
3. ✅ Push code; CI/CD runs tests and deploys
4. ✅ Focus on business logic — infra is prewired

---
