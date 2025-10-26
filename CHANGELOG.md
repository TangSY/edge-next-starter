# Changelog

This file records all notable changes to this project.

Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2025-10-16

### Added

- Initial Next.js 15+ project architecture
- Cloudflare Pages deployment (Edge Runtime)
- D1 database integration and migrations
- R2 object storage integration (file upload)
- KV cache integration (performance)
- Tailwind CSS setup
- Strict TypeScript mode
- ESLint and Prettier configuration
- GitHub Actions CI/CD workflows
  - CI (lint, type‑check, build)
  - Test environment auto deploy
  - Production environment auto deploy
- Database migration scripts
- Database seed scripts
- Complete project docs
  - README.md (overview)
  - DEVELOPMENT.md (dev guide)
  - DEPLOYMENT.md (deployment guide)
  - QUICKSTART.md (quick start)
- Sample API routes
  - Health check endpoint
  - User CRUD API
  - File upload/download API
- Multi‑environment setup
  - Dev (`wrangler.toml`)
  - Test (`wrangler.test.toml`)
  - Prod (`wrangler.prod.toml`)
- Library clients
  - Database client wrapper
  - R2 storage client wrapper
  - KV cache client wrapper
- Cloudflare TypeScript types
- NPM scripts for common tasks
- Vitest test framework
  - 22+ unit tests
  - D1, R2, KV client coverage
  - Test‑first CI/CD pipeline
- pnpm enforced
  - .npmrc (China mirror)
  - preinstall check script
  - .nvmrc Node version management

### Infrastructure

- D1 database schemas
  - users
  - posts
  - migrations
- R2 bucket configuration
- KV namespace configuration

### Developer Experience

- HMR in dev
- Type‑safe API development
- Auto formatting
- Preconfigured lint rules
- Git workflow docs
- Test watch mode
