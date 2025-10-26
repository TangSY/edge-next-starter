# Repository 模式指南

## 概述

本项目使用 **Repository 模式** 分离数据访问与业务逻辑层，提升可维护性与可测试性。Repository 位于项目根目录，作为领域层组件。

## 架构分层

```
API 路由 (app/api/*)
    ↓ 业务逻辑 + 验证
Repository 层 (repositories/*)
    ↓ 数据库操作 + 异常处理
Prisma Client (lib/db/client.ts)
    ↓
D1 Database
```

### 职责划分

| 层级       | 职责                                                | 不应该做                         |
| ---------- | --------------------------------------------------- | -------------------------------- |
| API 路由   | 解析请求、业务逻辑、参数校验、缓存管理、统一响应    | 直接写 SQL、管理数据库连接       |
| Repository | 数据库 CRUD、构建查询、数据库异常处理、简单数据映射 | 业务校验、复杂业务逻辑、缓存处理 |

## 目录结构

```
repositories/
├── index.ts                 # Repository 工厂与导出
├── user.repository.ts       # 用户数据操作
└── post.repository.ts       # 文章数据操作

lib/db/
└── client.ts                # Prisma 客户端（单例）
```

## Repository 示例

### 创建 Repository

```typescript
// repositories/user.repository.ts
import { PrismaClient } from '@prisma/client';
import { DatabaseQueryError } from '@/lib/errors';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 查询所有用户（仅数据库操作）
   */
  async findAll(orderBy: 'asc' | 'desc' = 'desc') {
    try {
      return await this.prisma.user.findMany({
        orderBy: { createdAt: orderBy },
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch users', error);
    }
  }

  /**
   * 根据邮箱检查是否存在
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({ where: { email } });
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError('Failed to check email existence', error);
    }
  }
}
```

### 在 API 路由中使用

```typescript
// app/api/users/route.ts
import { withRepositories } from '@/lib/api';

export async function POST(request: NextRequest) {
  return withRepositories(request, async repos => {
    // 1) 解析请求
    const { email, name } = await request.json();

    // 2) 业务验证
    if (!email) throw new ValidationError('Email is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new ValidationError('Invalid email format');

    // 3) 冲突检查
    if (await repos.users.existsByEmail(email)) {
      throw new ResourceAlreadyExistsError('User with this email');
    }

    // 4) 通过 Repository 进行数据库操作
    const user = await repos.users.create({ email, name });

    // 5) 业务侧缓存管理
    const cache = createCacheClient();
    await cache?.delete('users:all');

    return createdResponse(user, 'User created successfully');
  });
}
```

## 方法命名规范

### 查询方法

```typescript
findById(id: number)
findByEmail(email: string)
findAll(options?)
findByUserId(userId: number)
findByIdWithPosts(id: number)
exists(id: number): Promise<boolean>
existsByEmail(email: string): Promise<boolean>
count(options?): Promise<number>
```

### 修改方法

```typescript
create(data: CreateData)
update(id: number, data: UpdateData)
delete(id: number)
publish(id: number)      // 发布
unpublish(id: number)    // 取消发布
```

## 异常处理规范

### Repository 层

仅抛出数据库相关异常，并转换为应用异常：

```typescript
async findById(id: number) {
  try {
    return await this.prisma.user.findUnique({ where: { id } });
  } catch (error) {
    throw new DatabaseQueryError(`Failed to fetch user with id ${id}`, error);
  }
}
```

### API 路由层

处理业务逻辑异常：

```typescript
if (!email) throw new ValidationError('Email is required');
if (!user) throw new ResourceNotFoundError('User');
if (exists) throw new ResourceAlreadyExistsError('User with this email');
```

## 数据映射

Repository 可进行简单映射，但避免复杂业务：

```typescript
// ✅ 简单映射
async create(data: { email: string; name?: string }) {
  return await this.prisma.user.create({
    data: { email: data.email, name: data.name || null },
  });
}

// ❌ 复杂业务（应在 API 层）
async create(data: { email: string; name?: string }) {
  if (!this.isValidEmail(data.email)) throw new ValidationError('Invalid email');
  const isPremium = this.calculateUserTier(data);
  return await this.prisma.user.create({ data: { ...data, isPremium } });
}
```

## 使用 Repository Factory

提供统一访问入口：

```typescript
// repositories/index.ts
export class RepositoryFactory {
  constructor(private prisma: PrismaClient) {}
  get users(): UserRepository {
    return new UserRepository(this.prisma);
  }
  get posts(): PostRepository {
    return new PostRepository(this.prisma);
  }
}

// Usage
import { createRepositories } from '@/repositories';
const repos = createRepositories(prisma);
const users = await repos.users.findAll();
const posts = await repos.posts.findByUserId(1);
```

## withRepositories 包装器

减少重复初始化代码：

```typescript
// lib/api/database.ts
export async function withRepositories<T>(
  request: NextRequest,
  handler: (repos: RepositoryFactory) => Promise<NextResponse<T>>
): Promise<NextResponse<T>>;
```

### 数据库连接复用

**重要:** 内部使用 Prisma 单例：

```typescript
let prismaClient: PrismaClient | null = null;
export function createPrismaClient(): PrismaClient | null {
  if (prismaClient) return prismaClient; // 复用
  prismaClient = new PrismaClient({ adapter }); // 创建并缓存
  return prismaClient;
}
```

**为什么?** 在 Cloudflare Workers Edge Runtime：

1. 每个 isolate 拥有独立全局作用域
2. 同一 isolate 内请求复用同一 PrismaClient
3. 避免每次请求新建连接，显著提升性能
4. D1 adapter 管理连接，无需手动连接池

**性能对比:**

- ❌ 旧方案：每请求新建 PrismaClient → ~50–100ms
- ✅ 新方案：复用 PrismaClient → ~0–5ms

### 优势

1. 自动初始化（Prisma + Repository 工厂）
2. 连接复用（单例）
3. 统一错误处理
4. 减少重复代码
5. 类型安全
6. 集成请求日志/错误处理

### 使用示例

```typescript
// 旧方式：手动初始化
export async function GET(request: NextRequest) {
  return withMiddleware(request, async () => {
    const prisma = createPrismaClient();
    if (!prisma) throw new DatabaseConnectionError('Database not available');
    const repos = createRepositories(prisma);
    const users = await repos.users.findAll();
    return successResponse(users);
  });
}

// 新方式：withRepositories
export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    const users = await repos.users.findAll();
    return successResponse(users);
  });
}
```

### 完整示例（分页）

```typescript
export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    const p = request.nextUrl.searchParams;
    const page = parseInt(p.get('page') || '1', 10);
    const limit = parseInt(p.get('limit') || '10', 10);
    if (page < 1 || limit < 1 || limit > 100) {
      throw new ValidationError('Invalid pagination parameters');
    }
    const [posts, total] = await Promise.all([
      repos.posts.findAll({ skip: (page - 1) * limit, take: limit }),
      repos.posts.count(),
    ]);
    return paginatedResponse(posts, page, limit, total);
  });
}
```

## 测试

Repository 模式便于测试：

```typescript
const mockUserRepo = {
  findById: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
  create: jest.fn(),
};
```

## 最佳实践

### ✅ 推荐

1. 单一职责：每个 Repository 只管理一个实体
2. 统一异常：数据库异常转换为应用异常
3. 类型安全：充分利用 Prisma 类型
4. 注释清晰：方法文档完整
5. 返回完整对象：需要时包含关系

### ❌ 避免

1. 业务逻辑：不在 Repository 中验证
2. 外部依赖：不调用外部服务或 API
3. 复杂计算：不进行复杂计算
4. 缓存管理：不在此层处理

```typescript
// ❌ Bad
async create(data) {
  // ❌ 不要在此层进行验证
  if (!this.isValidEmail(data.email)) {
    throw new ValidationError();
  }

  // ❌ 不要在此层调用外部服务
  await this.sendWelcomeEmail(data.email);

  // ❌ 不要在此层管理缓存
  await this.cache.delete('users');

  return await this.prisma.user.create({ data });
}
```

## 扩展 Repository

新增一个 Repository：

```typescript
// 1. 新增 Repository 类
export class CommentRepository {
  constructor(private prisma: PrismaClient) {}
  async findAll() {
    try {
      return await this.prisma.comment.findMany();
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch comments', error);
    }
  }
}

// 2. 注册到工厂
export class RepositoryFactory {
  get comments(): CommentRepository {
    return new CommentRepository(this.prisma);
  }
}

// 3. 导出
export { CommentRepository } from './comment.repository';

// 4. 使用
import { createRepositories } from '@/repositories';
const repos = createRepositories(prisma);
const comments = await repos.comments.findAll();
```

## 总结

核心原则：

1. 📦 封装数据访问：所有数据库操作经由 Repository
2. 🎯 单一职责：Repository 只负责数据
3. 🚫 无业务逻辑：业务规则在 API 层处理
4. ⚠️ 统一异常：数据库错误转换为应用异常
5. 🧪 易于测试：可轻松 mock 与单测

遵循以上原则，代码清晰、易维护。
