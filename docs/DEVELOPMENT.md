# Development Guide

This guide helps you quickly master the project’s development workflow and best practices.

## 🏗️ 项目架构

### Tech Stack

- **Framework**: Next.js 15.5.2 + App Router
- **Language**: TypeScript (strict mode)
- **Styles**: Tailwind CSS
- **Runtime**: Cloudflare Workers Edge Runtime
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **Testing**: Vitest
- **Package Manager**: pnpm

### Directory Structure

```
cloudflare-worker-template/
├── app/                 # Next.js app directory
│   ├── api/            # API routes (Edge Runtime)
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── lib/                # Libraries
│   ├── db/            # D1 DB wrapper
│   ├── r2/            # R2 wrapper
│   └── cache/         # KV cache wrapper
├── components/         # React components
├── types/             # TypeScript types
├── migrations/        # DB migrations
├── scripts/           # Automation scripts
└── __tests__/         # Tests
```

## 🚀 Development Workflow

### 1. Local Development

```bash
# Fast UI dev (no Cloudflare bindings)
pnpm dev

# Full‑stack dev (with Cloudflare)
pnpm build && pnpm run pages:build && pnpm run cf:dev
```

### 2. Code Quality

The project enforces code quality:

```bash
# Format code
pnpm format

# Check formatting
pnpm run format:check

# ESLint
pnpm lint

# TypeScript type‑check
pnpm run type-check
```

### 3. Test‑Driven Development

```bash
# Run all tests
pnpm test

# Watch mode (recommended during dev)
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

## 📝 Writing Code

### API Route Example

在 `app/api/` 下创建新的 API 路由：

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from '@/lib/db/client';

export const runtime = 'edge'; // Enable Edge Runtime

export async function GET(request: NextRequest) {
  const db = createDatabaseClient();

  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  // Your business logic
  const data = await db.query('SELECT * FROM your_table');

  return NextResponse.json({ data });
}
```

### Database Operations

```typescript
import { createDatabaseClient } from '@/lib/db/client';

const db = createDatabaseClient();

// Query many
const users = await db.query<User>('SELECT * FROM users');

// Query one
const user = await db.queryOne<User>('SELECT * FROM users WHERE id = ?', [userId]);

// Insert / update / delete
const result = await db.execute('INSERT INTO users (email, name) VALUES (?, ?)', [email, name]);

// Batch operations
await db.batch([
  { sql: 'INSERT INTO users (email) VALUES (?)', params: ['a@example.com'] },
  { sql: 'INSERT INTO users (email) VALUES (?)', params: ['b@example.com'] },
]);
```

### R2 Storage Operations

```typescript
import { createR2Client } from '@/lib/r2/client';

const r2 = createR2Client();

// Upload file
await r2.put('uploads/file.jpg', fileData, {
  httpMetadata: { contentType: 'image/jpeg' },
});

// Download file
const object = await r2.get('uploads/file.jpg');
const blob = await object.blob();

// Delete file
await r2.delete('uploads/file.jpg');

// List files
const list = await r2.list({ prefix: 'uploads/' });
```

### KV Cache Operations

```typescript
import { withCache } from '@/lib/cache/client';

// Use cache wrapper
const data = await withCache(
  'cache-key',
  async () => {
    // Expensive operation
    return await fetchExpensiveData();
  },
  3600 // TTL (seconds)
);
```

## 🗄️ Database Management

The project uses **Wrangler D1 migrations** to manage schema, and Prisma for type‑safe queries. In daily dev:

- Use `pnpm run db:migrations:create` to generate a migration
- Run `pnpm run db:migrate:local` / `pnpm run db:migrate:test` / `pnpm run db:migrate:prod`
- After schema changes, update `prisma/schema.prisma` and run `pnpm prisma:generate`

Naming conventions, rollback strategy, and data migration scripting are detailed in [Migrations Guide](./MIGRATIONS.md).

## 🧪 Writing Tests

### Unit Test Example

```typescript
// __tests__/lib/my-feature.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '@/lib/my-feature';

describe('My Feature', () => {
  it('should work correctly', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Mock Cloudflare Bindings

```typescript
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn().mockResolvedValue({ results: [] }),
} as any;
```

## 🔄 Git Workflow

### Branching Strategy

- `main` — production (auto deploy)
- `develop` — test (auto deploy)
- `feature/*` — feature development
- `fix/*` — bug fixes

### Commit Conventions

Use Conventional Commits:

```bash
feat: add user authentication
fix: fix file upload issue
docs: update API docs
test: add user tests
refactor: refactor DB queries
style: format code
chore: update dependencies
```

### Release Management

The project uses **automated CHANGELOG generation** via `release-please`. To trigger a release:

**Include `[release]` in your commit message:**

```bash
# Regular commits (not included in immediate CHANGELOG)
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# Release commit (triggers CHANGELOG PR creation)
git commit -m "chore: prepare v1.2.0 release [release]"
```

**What happens when you use `[release]`:**

1. ✅ GitHub Actions detects the `[release]` tag
2. ✅ `release-please` scans **all commits since the last release**
3. ✅ Automatically creates a PR with:
   - Updated `CHANGELOG.md` (all feat/fix/docs commits)
   - Version bump in `package.json` (following semver)
4. ✅ Merge the PR to publish the release

**Best practices:**

- Use `[release]` only when you're ready to cut a new version
- All feature/fix commits between releases will be included automatically
- No need to manually update CHANGELOG or version numbers

### Development Flow

```bash
# 1. Create a feature branch
git checkout -b feature/awesome-feature

# 2. Develop and test
pnpm dev
pnpm test

# 3. Commit code
git add .
git commit -m "feat: add awesome feature"

# 4. Push to remote
git push origin feature/awesome-feature

# 5. Open a Pull Request
# CI runs tests automatically
```

## ⚙️ GitHub Actions Setup

### Enable Workflow Permissions

To allow GitHub Actions to automatically create pull requests (e.g., for CHANGELOG updates via release-please), configure repository settings:

1. **Navigate to repository settings:**
   - Go to your repository: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - Click **Settings** in the top menu

2. **Configure Actions permissions:**
   - In the left sidebar, click **Actions** → **General**
   - Or directly visit: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/actions`

3. **Update Workflow permissions:**

   Scroll to the **"Workflow permissions"** section at the bottom:

   ```
   ○ Read repository contents and packages permissions
   ● Read and write permissions  ← Select this

   ☑ Allow GitHub Actions to create and approve pull requests  ← Check this
   ```

4. **Save settings:**
   - Click **Save** to apply changes

### Why This Is Required

By default, GitHub restricts Actions from creating pull requests for security. Our automated workflows need these permissions to:

- **Auto-update CHANGELOG**: The `release-please` workflow creates PRs with version updates
- **Dependency updates**: Automated dependency update bots (e.g., Dependabot, Renovate)
- **Code generation**: Workflows that auto-generate code and create PRs

## 🔧 Troubleshooting

### View logs

```bash
# 实时查看 Cloudflare Workers 日志
wrangler tail
```

### Local DB queries

```bash
wrangler d1 execute cloudflare-worker-template-local --local \
  --command="SELECT * FROM users"
```

### Common issues

**pnpm install failed?**

```bash
pnpm store prune && pnpm install
```

**Type errors?**

```bash
pnpm run type-check
```

**Tests failing?**
Check Cloudflare bindings are configured correctly.

**Local DB is empty?**

```bash
pnpm run db:migrate:local
pnpm run db:seed -- --env=local
```

## 📖 Further Reading

- [Next.js Docs](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Vitest Docs](https://vitest.dev/)
- [pnpm Docs](https://pnpm.io/)

---
