# 数据库迁移指南

## 概述

本项目使用 **Wrangler D1 迁移系统** 管理数据库结构，使用 **Prisma** 作为类型安全的查询 ORM。

### 为什么不使用 Prisma Migrate？

Cloudflare D1 目前不支持 Prisma Migrate，因为：

1. D1 是边缘数据库，有特殊的迁移机制
2. Prisma Migrate 需要直接数据库连接，而 D1 通过 Wrangler CLI 管理
3. 两套迁移系统会产生冲突

### 我们的方案

- **迁移管理**: Wrangler D1 (`migrations/*.sql`)
- **查询操作**: Prisma Client (类型安全、自动补全)

## 迁移工作流

### 1. 创建新迁移

当需要修改数据库结构时：

```bash
# 创建新迁移文件
pnpm run db:migrations:create add_new_table

# 这会在 migrations/ 目录创建一个新文件
# 例如: migrations/0002_add_new_table.sql
```

### 2. 编写迁移 SQL

编辑新创建的 SQL 文件：

```sql
-- Migration: 002_add_new_table
-- Description: 添加新的表结构
-- Created: 2025-01-XX

CREATE TABLE IF NOT EXISTS new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);
```

### 3. 更新 Prisma Schema

在 `prisma/schema.prisma` 中添加对应的模型：

```prisma
model NewTable {
  id        Int    @id @default(autoincrement())
  name      String
  createdAt Int    @default(dbgenerated("(strftime('%s', 'now'))")) @map("created_at")

  @@index([name])
  @@map("new_table")
}
```

**重要**: Prisma schema 必须与 SQL 迁移保持一致！

### 4. 执行迁移

```bash
# 本地开发环境
pnpm run db:migrate:local

# 测试环境
pnpm run db:migrate:test

# 生产环境
pnpm run db:migrate:prod
```

### 5. 重新生成 Prisma Client

```bash
pnpm prisma:generate
```

### 6. 使用新模型

```typescript
import { createPrismaClient } from '@/lib/db/client';

const prisma = createPrismaClient();
const items = await prisma.newTable.findMany();
```

## 常用命令

```bash
# 查看迁移列表
pnpm run db:migrations:list

# 创建新迁移
pnpm run db:migrations:create <name>

# 执行迁移
pnpm run db:migrate:local    # 本地
pnpm run db:migrate:test     # 测试
pnpm run db:migrate:prod     # 生产

# 生成 Prisma 客户端
pnpm prisma:generate
```

## 迁移文件命名规范

```
migrations/
├── 0001_init.sql                    # 初始化表结构
├── 0002_add_user_avatar.sql         # 添加用户头像字段
├── 0003_create_comments_table.sql   # 创建评论表
└── 0004_add_indexes.sql             # 添加索引优化
```

命名格式: `<序号>_<简短描述>.sql`

## 迁移最佳实践

### 1. 向前兼容

避免破坏性变更，使用分步迁移：

```sql
-- ❌ 不好: 直接删除列
ALTER TABLE users DROP COLUMN old_field;

-- ✅ 好: 分步进行
-- 迁移1: 添加新列
ALTER TABLE users ADD COLUMN new_field TEXT;

-- 迁移2: 数据迁移（在代码中处理）
-- 迁移3: 删除旧列
ALTER TABLE users DROP COLUMN old_field;
```

### 2. 使用事务

虽然 D1 迁移默认在事务中执行，但要确保 SQL 的原子性：

```sql
-- 多个相关操作放在同一个迁移文件中
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- 相关的外键表也在同一迁移中创建
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 3. 添加注释

```sql
-- Migration: 005_optimize_queries
-- Description: 为常用查询添加索引
-- Created: 2025-01-17
-- Author: Your Name

-- 用户邮箱查询优化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 文章发布状态查询优化
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
```

### 4. 保持 Prisma Schema 同步

每次修改迁移后，立即更新 `prisma/schema.prisma`：

```prisma
// SQL: ALTER TABLE users ADD COLUMN avatar TEXT;
model User {
  // ... 其他字段
  avatar String? // 新增字段
}
```

### 5. 测试迁移

在本地测试迁移后再部署：

```bash
# 1. 本地测试
pnpm run db:migrate:local
pnpm prisma:generate
pnpm type-check  # 确保类型正确

# 2. 测试环境验证
pnpm run db:migrate:test

# 3. 生产环境部署
pnpm run db:migrate:prod
```

## 回滚策略

D1 不支持自动回滚，需要手动创建反向迁移：

```bash
# 创建回滚迁移
pnpm run db:migrations:create rollback_add_user_avatar
```

```sql
-- migrations/0006_rollback_add_user_avatar.sql
-- 回滚 0002_add_user_avatar.sql

ALTER TABLE users DROP COLUMN avatar;
```

## 数据迁移

对于需要数据转换的迁移，分两步：

### 1. 结构迁移 (SQL)

```sql
-- migrations/0007_split_user_name.sql
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
```

### 2. 数据迁移 (脚本)

创建 `scripts/migrate-user-names.ts`:

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

运行数据迁移：

```bash
node scripts/migrate-user-names.ts
```

## 环境差异处理

不同环境可能需要不同的迁移策略：

```bash
# 开发环境: 可以随意重置
rm -rf .wrangler/state/v3/d1
pnpm run db:migrate:local

# 生产环境: 必须谨慎，使用向前兼容的迁移
pnpm run db:migrate:prod
```

## 故障排查

### 问题 1: Prisma 类型与数据库不匹配

```bash
# 解决方案: 重新生成 Prisma 客户端
pnpm prisma:generate
```

### 问题 2: 迁移执行失败

```bash
# 查看迁移状态
pnpm run db:migrations:list

# 查看错误日志
wrangler d1 migrations apply cloudflare-worker-template-local --local
```

### 问题 3: 本地数据库损坏

```bash
# 删除本地数据库并重新迁移
rm -rf .wrangler/state/v3/d1
pnpm run db:migrate:local
```

## 总结

记住这个黄金法则：

1. **结构变更** → Wrangler D1 迁移 (`.sql` 文件)
2. **类型定义** → Prisma Schema (`.prisma` 文件)
3. **查询操作** → Prisma Client (TypeScript 代码)

保持这三者同步，就能充分发挥类型安全和迁移管理的优势！🎯
