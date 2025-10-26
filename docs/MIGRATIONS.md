# Database Migrations Guide

## Overview

This project uses **Wrangler D1** to manage database schema, and **Prisma** for type‑safe queries.

### Why not Prisma Migrate?

Cloudflare D1 doesn’t support Prisma Migrate because:

1. D1 is an edge DB with a dedicated migration mechanism
2. Prisma Migrate requires direct DB connections while D1 is managed via Wrangler CLI
3. Two migration systems would conflict

### Our Approach

- **Migrations**: Wrangler D1 (`migrations/*.sql`)
- **Queries**: Prisma Client (type‑safe, autocomplete)

## Workflow

### 1. Create a migration

When changing schema:

```bash
# Create a new migration file
pnpm run db:migrations:create add_new_table

# This creates a new file under migrations/
# e.g. migrations/0002_add_new_table.sql
```

### 2. Write migration SQL

Edit the new SQL file:

```sql
-- Migration: 002_add_new_table
-- Description: Add new table schema
-- Created: 2025-01-XX

CREATE TABLE IF NOT EXISTS new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);
```

### 3. Update Prisma Schema

Add the matching model in `prisma/schema.prisma`:

```prisma
model NewTable {
  id        Int    @id @default(autoincrement())
  name      String
  createdAt Int    @default(dbgenerated("(strftime('%s', 'now'))")) @map("created_at")

  @@index([name])
  @@map("new_table")
}
```

Important: Prisma schema must match SQL migrations!

### 4. Apply migrations

```bash
# Local
pnpm run db:migrate:local

# Test
pnpm run db:migrate:test

# Production
pnpm run db:migrate:prod
```

### 5. Regenerate Prisma Client

```bash
pnpm prisma:generate
```

### 6. Use the new model

```typescript
import { createPrismaClient } from '@/lib/db/client';

const prisma = createPrismaClient();
const items = await prisma.newTable.findMany();
```

## Commands

```bash
# List migrations
pnpm run db:migrations:list

# Create migration
pnpm run db:migrations:create <name>

# Apply migrations
pnpm run db:migrate:local    # local
pnpm run db:migrate:test     # test
pnpm run db:migrate:prod     # production

# Generate Prisma client
pnpm prisma:generate
```

## Naming

```
migrations/
├── 0001_init.sql                    # initialize tables
├── 0002_add_user_avatar.sql         # add user avatar field
├── 0003_create_comments_table.sql   # create comments table
└── 0004_add_indexes.sql             # add indexes
```

Format: `<sequence>_<short-description>.sql`

## Best Practices

### 1. Forward compatibility

Avoid breaking changes; use staged migrations:

```sql
-- ❌ Avoid: dropping columns directly
ALTER TABLE users DROP COLUMN old_field;

-- ✅ Prefer: staged steps
-- Step 1: add new column
ALTER TABLE users ADD COLUMN new_field TEXT;

-- Step 2: data migration (in code)
-- Step 3: drop old column
ALTER TABLE users DROP COLUMN old_field;
```

### 2. Use transactions

While D1 runs migrations in a transaction, ensure SQL atomicity:

```sql
-- Group related operations in one migration file
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Create related foreign key tables in the same migration
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 3. Add comments

```sql
-- Migration: 005_optimize_queries
-- Description: Add indexes for common queries
-- Created: 2025-01-17
-- Author: Your Name

-- Optimize email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optimize published status queries
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
```

### 4. Keep Prisma Schema in sync

After migration changes, update `prisma/schema.prisma`:

```prisma
// SQL: ALTER TABLE users ADD COLUMN avatar TEXT;
model User {
  // ... other fields
  avatar String? // new field
}
```

### 5. Test migrations

Test migrations locally before deploying:

```bash
# 1. Local
pnpm run db:migrate:local
pnpm prisma:generate
pnpm type-check  # ensure types pass

# 2. Test environment
pnpm run db:migrate:test

# 3. Production
pnpm run db:migrate:prod
```

## Rollback

D1 doesn’t support auto rollback; create reverse migrations manually:

```bash
# Create rollback migration
pnpm run db:migrations:create rollback_add_user_avatar
```

```sql
-- migrations/0006_rollback_add_user_avatar.sql
-- Rollback 0002_add_user_avatar.sql

ALTER TABLE users DROP COLUMN avatar;
```

## Data Migrations

For migrations requiring data transformation, use two steps:

### 1. Schema (SQL)

```sql
-- migrations/0007_split_user_name.sql
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
```

### 2. Data (script)

Create `scripts/migrate-user-names.ts`:

```typescript
import { createPrismaClient } from '@/lib/db/client';

async function migrateUserNames() {
  const prisma = createPrismaClient();
  if (!prisma) throw new Error('Database not available');

  const users = await prisma.user.findMany();

  for (const user of users) {
    if (user.name) {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName: lastNameParts.join(' ') || null,
        },
      });
    }
  }

  console.log(`Migrated ${users.length} users`);
}

migrateUserNames();
```

Run the data migration:

```bash
node scripts/migrate-user-names.ts
```

## Environment Differences

Different environments may require different strategies:

```bash
# Dev: reset freely
rm -rf .wrangler/state/v3/d1
pnpm run db:migrate:local

# Prod: be cautious; prefer forward‑compatible migrations
pnpm run db:migrate:prod
```

## Troubleshooting

### Issue 1: Prisma types mismatch DB

```bash
# Solution: regenerate Prisma client
pnpm prisma:generate
```

### Issue 2: Migration apply failed

```bash
# Check migration status
pnpm run db:migrations:list

# View error logs
wrangler d1 migrations apply cloudflare-worker-template-local --local
```

### Issue 3: Local DB corrupted

```bash
# Remove local DB and re‑migrate
rm -rf .wrangler/state/v3/d1
pnpm run db:migrate:local
```

## Summary

Remember:

1. **Schema changes** → Wrangler D1 migrations (`.sql`)
2. **Type definitions** → Prisma Schema (`.prisma`)
3. **Queries** → Prisma Client (TypeScript)

Keep these in sync to leverage type safety and migration management! 🎯
