# 开发指南

本指南帮助你快速掌握项目开发流程和最佳实践。

## 🏗️ 项目架构

### 技术栈

- **框架**：Next.js 15.5.2 + App Router
- **语言**：TypeScript (严格模式)
- **样式**：Tailwind CSS
- **运行时**：Cloudflare Workers Edge Runtime
- **数据库**：Cloudflare D1 (SQLite)
- **存储**：Cloudflare R2
- **缓存**：Cloudflare KV
- **测试**：Vitest
- **包管理**：pnpm

### 目录结构

```
cloudflare-worker-template/
├── app/                 # Next.js 应用目录
│   ├── api/            # API 路由 (Edge Runtime)
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── lib/                # 工具库
│   ├── db/            # D1 数据库封装
│   ├── r2/            # R2 存储封装
│   └── cache/         # KV 缓存封装
├── components/         # React 组件
├── types/             # TypeScript 类型
├── migrations/        # 数据库迁移
├── scripts/           # 自动化脚本
└── __tests__/         # 测试文件
```

## 🚀 开发工作流

### 1. 本地开发

```bash
# 快速 UI 开发（无 Cloudflare 功能）
pnpm dev

# 完整功能开发（含 Cloudflare）
pnpm build && pnpm run pages:build && pnpm run cf:dev
```

### 2. 代码规范

项目强制执行代码规范：

```bash
# 格式化代码
pnpm format

# 检查格式
pnpm run format:check

# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm run type-check
```

### 3. 测试驱动开发

```bash
# 运行所有测试
pnpm test

# 监听模式（推荐开发时使用）
pnpm run test:watch

# 查看覆盖率
pnpm run test:coverage
```

## 📝 编写代码

### API 路由示例

在 `app/api/` 下创建新的 API 路由：

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from '@/lib/db/client';

export const runtime = 'edge'; // 重要：启用 Edge Runtime

export async function GET(request: NextRequest) {
  const db = createDatabaseClient();

  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  // 你的业务逻辑
  const data = await db.query('SELECT * FROM your_table');

  return NextResponse.json({ data });
}
```

### 数据库操作

```typescript
import { createDatabaseClient } from '@/lib/db/client';

const db = createDatabaseClient();

// 查询多条
const users = await db.query<User>('SELECT * FROM users');

// 查询单条
const user = await db.queryOne<User>('SELECT * FROM users WHERE id = ?', [userId]);

// 插入/更新/删除
const result = await db.execute('INSERT INTO users (email, name) VALUES (?, ?)', [email, name]);

// 批量操作
await db.batch([
  { sql: 'INSERT INTO users (email) VALUES (?)', params: ['a@example.com'] },
  { sql: 'INSERT INTO users (email) VALUES (?)', params: ['b@example.com'] },
]);
```

### R2 存储操作

```typescript
import { createR2Client } from '@/lib/r2/client';

const r2 = createR2Client();

// 上传文件
await r2.put('uploads/file.jpg', fileData, {
  httpMetadata: { contentType: 'image/jpeg' },
});

// 下载文件
const object = await r2.get('uploads/file.jpg');
const blob = await object.blob();

// 删除文件
await r2.delete('uploads/file.jpg');

// 列出文件
const list = await r2.list({ prefix: 'uploads/' });
```

### KV 缓存操作

```typescript
import { withCache } from '@/lib/cache/client';

// 使用缓存包装器
const data = await withCache(
  'cache-key',
  async () => {
    // 耗时操作
    return await fetchExpensiveData();
  },
  3600 // TTL（秒）
);
```

## 🗄️ 数据库管理

项目统一使用 **Wrangler 官方迁移系统** 管理数据库结构，并通过 Prisma 负责类型安全的查询。日常开发只需关注：

- 使用 `pnpm run db:migrations:create` 生成新的迁移文件
- 根据环境运行 `pnpm run db:migrate:local` / `pnpm run db:migrate:test` / `pnpm run db:migrate:prod`
- 每次结构变更后同步更新 `prisma/schema.prisma` 并执行 `pnpm prisma:generate`

命名规范、回滚策略、数据迁移脚本等详细说明已移至 [数据库迁移指南](./MIGRATIONS-zh.md)，如需深入了解可直接查阅。

## 🧪 编写测试

### 单元测试示例

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

### Mock Cloudflare 绑定

```typescript
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  all: vi.fn().mockResolvedValue({ results: [] }),
} as any;
```

## 🔄 Git 工作流

### 分支策略

- `main` - 生产环境（自动部署）
- `develop` - 测试环境（自动部署）
- `feature/*` - 功能开发
- `fix/*` - Bug 修复

### 提交规范

使用约定式提交：

```bash
feat: 添加用户认证功能
fix: 修复文件上传问题
docs: 更新 API 文档
test: 添加用户测试用例
refactor: 重构数据库查询
style: 格式化代码
chore: 更新依赖包
```

### 发布管理

项目使用 **自动化 CHANGELOG 生成**（通过 `release-please`）。要触发发布：

**在提交消息中包含 `[release]` 标签：**

```bash
# 常规提交（不会立即触发 CHANGELOG 更新）
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复 Bug"

# 发布提交（触发 CHANGELOG PR 创建）
git commit -m "chore: 准备 v1.2.0 版本发布 [release]"
```

**使用 `[release]` 后会发生什么：**

1. ✅ GitHub Actions 检测到 `[release]` 标签
2. ✅ `release-please` 扫描**自上次发布以来的所有提交**
3. ✅ 自动创建一个 PR，包含：
   - 更新的 `CHANGELOG.md`（包含所有 feat/fix/docs 提交）
   - `package.json` 中的版本号升级（遵循语义化版本）
4. ✅ 合并 PR 即可发布新版本

**最佳实践：**

- 只在准备发布新版本时使用 `[release]`
- 两次发布之间的所有功能/修复提交会自动包含在 CHANGELOG 中
- 无需手动更新 CHANGELOG 或版本号

### 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/awesome-feature

# 2. 开发并测试
pnpm dev
pnpm test

# 3. 提交代码
git add .
git commit -m "feat: add awesome feature"

# 4. 推送到远程
git push origin feature/awesome-feature

# 5. 创建 Pull Request
# GitHub 上创建 PR，CI 会自动运行测试
```

## ⚙️ GitHub Actions 配置

### 启用工作流权限

要允许 GitHub Actions 自动创建 Pull Request（例如通过 release-please 自动更新 CHANGELOG），需要配置仓库设置：

1. **进入仓库设置页面：**
   - 访问你的仓库：`https://github.com/你的用户名/你的仓库`
   - 点击顶部菜单的 **Settings**（设置）

2. **配置 Actions 权限：**
   - 在左侧边栏找到 **Actions** → **General**
   - 或直接访问：`https://github.com/你的用户名/你的仓库/settings/actions`

3. **修改 Workflow permissions（工作流权限）：**

   滚动到页面底部的 **"Workflow permissions"** 部分：

   ```
   ○ Read repository contents and packages permissions
   ● Read and write permissions  ← 选择这个

   ☑ Allow GitHub Actions to create and approve pull requests  ← 勾选这个
   ```

4. **保存设置：**
   - 点击页面底部的 **Save** 按钮保存更改

### 为什么需要这个配置

GitHub 默认出于安全考虑限制 Actions 创建 Pull Request。我们的自动化工作流需要这些权限来：

- **自动更新 CHANGELOG**：`release-please` 工作流会创建包含版本更新的 PR
- **依赖更新**：自动化依赖更新工具（如 Dependabot、Renovate）
- **代码生成**：自动生成代码并创建 PR 的工作流

## 🔧 故障排除

### 查看日志

```bash
# 实时查看 Cloudflare Workers 日志
wrangler tail
```

### 本地数据库查询

```bash
wrangler d1 execute cloudflare-worker-template-local --local \
  --command="SELECT * FROM users"
```

### 常见问题

**pnpm 安装失败？**

```bash
pnpm store prune && pnpm install
```

**类型错误？**

```bash
pnpm run type-check
```

**测试失败？**
检查 Cloudflare 绑定是否正确配置

**本地数据库为空？**

```bash
pnpm run db:migrate:local
pnpm run db:seed -- --env=local
```

## 📖 延伸阅读

- [Next.js 文档](https://nextjs.org/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Vitest 文档](https://vitest.dev/)
- [pnpm 文档](https://pnpm.io/)

---
