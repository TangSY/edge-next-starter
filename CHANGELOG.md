# Changelog

This file records all notable changes to this project.

Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [1.1.0](https://github.com/TangSY/edge-next-starter/compare/cloudflare-worker-template-v1.0.0...cloudflare-worker-template-v1.1.0) (2025-11-02)

### ✨ Features

- add OAuth login ([2be786e](https://github.com/TangSY/edge-next-starter/commit/2be786e41afb79ebdf45a2d6ac1149e0638e95e1))
- add privacy policy and terms links to homepage footer ([715d6c5](https://github.com/TangSY/edge-next-starter/commit/715d6c5e9a6e6104477fe7158ecc7f9f6befdaa3))
- add privacy terms example ([694e449](https://github.com/TangSY/edge-next-starter/commit/694e4498a553bc34c46d62fdafa3c77f5650e8a9))
- implement authentication system with NextAuth v5 ([063dbeb](https://github.com/TangSY/edge-next-starter/commit/063dbebe1a658b97bda7cfc3a5ccbb40d270313e))
- init project ([80cf32c](https://github.com/TangSY/edge-next-starter/commit/80cf32c0f59033428c6f82283ed08c4f0d8355ac))
- **upload:** add image/audio/video preview support ([f802b4b](https://github.com/TangSY/edge-next-starter/commit/f802b4b465de4976a7273e0515cc65b10881dbf2))
- **upload:** support multi-file upload ([6056cd7](https://github.com/TangSY/edge-next-starter/commit/6056cd70950121d38e10bdc82b0d09516e8bdb38))

### 🐛 Bug Fixes

- add missing console warning in getCloudflareEnv ([39b7fb8](https://github.com/TangSY/edge-next-starter/commit/39b7fb8962e0ce8d0ae3492f61eb665650907a9b))
- AnalyticsEngineDataset binding ([caaa6f7](https://github.com/TangSY/edge-next-starter/commit/caaa6f70d3ea0c8fbc81929b2fb9d521645e5bea))
- Correct redirect logic for login/register pages during local development ([95d7ddd](https://github.com/TangSY/edge-next-starter/commit/95d7dddf68116443f9eaf868c8c02b365f07570c))
- implement edge-compatible password hashing and resolve Cloudflare Pages deployment ([db1dd1c](https://github.com/TangSY/edge-next-starter/commit/db1dd1cda40b27a23345081821968f9e48d50a81))
- implement edge-compatible password hashing and resolve Cloudflare Pages deployment ([f1b1f3c](https://github.com/TangSY/edge-next-starter/commit/f1b1f3c83ef1d979ccde6750d8d13d523788c89f))
- implement edge-compatible password hashing and resolve Cloudflare Pages deployment ([8d8c992](https://github.com/TangSY/edge-next-starter/commit/8d8c99226699edf894078cff07c40e152575db76))
- implement edge-compatible password hashing for Cloudflare Pages ([76fb29f](https://github.com/TangSY/edge-next-starter/commit/76fb29fca2cfe68836f867d28986bfd7f8ee0f82))
- resolve ESLint error and update package dependencies ([75a867c](https://github.com/TangSY/edge-next-starter/commit/75a867c6825086d1cd08b6f70d1be8aafdd81363))
- resolve NEXTAUTH_SECRET CI build issues ([397a1d0](https://github.com/TangSY/edge-next-starter/commit/397a1d00d0717d71d6023df958e0b8c7b6328bef))
- update dynamic route handlers for Next.js 15 async params ([12b50a0](https://github.com/TangSY/edge-next-starter/commit/12b50a02d8f152aaff86ce91324e0955758fe10e))
- validate-migrations script now respects Prisma @[@map](https://github.com/map) directive ([4040be1](https://github.com/TangSY/edge-next-starter/commit/4040be16a4c1064ca80ceced1aeb0af8c79fb603))

### ♻️ Code Refactoring

- **auth:** change middleware to default-protected strategy ([35e2c59](https://github.com/TangSY/edge-next-starter/commit/35e2c5937bb75fdb7cc4719fb364c466abf86a9a))
- reorganize project structure and fix sign out functionality ([9b49834](https://github.com/TangSY/edge-next-starter/commit/9b49834dc06751e45b2c60b3262fac5c3686101a))
- replace fetch with axios and unify API client ([31b29a8](https://github.com/TangSY/edge-next-starter/commit/31b29a8ce01c10093c25a0358b96b2a369e833c1))

### 📝 Documentation

- add language switcher to README files ([f9162ec](https://github.com/TangSY/edge-next-starter/commit/f9162ec5d828b2da60295e21fbf75a62f37452f7))
- add tech stack badges [release] ([fa17c78](https://github.com/TangSY/edge-next-starter/commit/fa17c78354827cc88a88d449d1af8953106476ad))
- internationalize project ([63012de](https://github.com/TangSY/edge-next-starter/commit/63012de43d2d1e381ecca07e8abe4bb17b3bcc37))
- sync docs with implementation ([1cf9a80](https://github.com/TangSY/edge-next-starter/commit/1cf9a80b31e9d11b5173475350ba02281d6b24b9))

### ✅ Tests

- mock cloudflare/next-on-pages ([502db21](https://github.com/TangSY/edge-next-starter/commit/502db21b5402888034cd6ba6c7211092f1d4090f))

### 👷 CI/CD

- skip CI for docs changes ([1480e0f](https://github.com/TangSY/edge-next-starter/commit/1480e0f5948cf0079cf9c37a47c10435c5c99f97))

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
