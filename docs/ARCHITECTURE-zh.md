# 项目架构说明

## 架构概览

本项目是一个基于 Next.js + Cloudflare 的全栈应用模板，具有完整的企业级架构特性。

## 架构图

```mermaid
graph TD
  A[客户端] -->|HTTPS 请求| B[Cloudflare Pages 边缘网络]
  B --> C[Next.js App Router (Edge Runtime)]
  C --> D[API 中间件<br/>日志 & 错误处理]
  D --> E[Repository Factory]
  E --> F[Prisma Client<br/>(D1 Adapter)]
  F --> G[(Cloudflare D1)]
  E --> H[(Cloudflare R2 Bucket)]
  D --> I[(Cloudflare KV Namespace)]
  C --> J[静态资源 / 页面渲染]
  subgraph CI/CD
    K[GitHub Actions
CI 工作流]
    L[GitHub Actions
部署工作流]
  end
  K --> L --> B
```

**数据流说明**：

- 客户端的所有请求都会先通过 Cloudflare Pages 的全球网络，再进入部署在 Edge Runtime 上的 Next.js 应用。
- API 路由统一经过中间件链路，负责请求日志、错误处理和速率限制，然后由 Repository 层协调对 D1、R2、KV 的访问。
- CI 工作流负责测试与构建，部署工作流在通过验证后将构建产出推送到 Cloudflare Pages。

## 技术栈

### 核心框架

- **Next.js 15.5.2** - React 框架，使用 App Router
- **Cloudflare Pages** - Edge Runtime 部署平台
- **TypeScript** - 类型安全的 JavaScript 超集

### 数据层

- **Prisma** - 现代化 ORM，提供类型安全的数据库操作
- **D1 Database** - Cloudflare 边缘数据库（SQLite）
- **R2 Storage** - 对象存储服务
- **KV Storage** - 键值缓存服务

### 工具链

- **pnpm** - 快速、节省磁盘空间的包管理器
- **Vitest** - 现代化测试框架
- **ESLint + Prettier** - 代码规范与格式化

## 项目结构

```
cloudflare-worker-template/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── health/          # 健康检查 API
│   │   ├── users/           # 用户 CRUD API
│   │   │   └── [id]/       # 单个用户操作
│   │   ├── posts/           # 文章 CRUD API
│   │   │   └── [id]/       # 单个文章操作
│   │   └── upload/          # 文件上传 API
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── repositories/             # 数据访问层（Repository 模式）
│   ├── index.ts             # Repository 工厂和导出
│   ├── user.repository.ts   # User 数据操作
│   └── post.repository.ts   # Post 数据操作
├── lib/                      # 核心库
│   ├── api/                 # API 工具
│   │   ├── response.ts     # 统一响应格式
│   │   ├── middleware.ts   # 请求日志中间件
│   │   ├── database.ts     # 数据库访问包装器
│   │   └── index.ts        # 导出入口
│   ├── db/                  # 数据库客户端
│   │   └── client.ts       # Prisma + D1 集成（单例模式）
│   ├── r2/                  # R2 存储客户端
│   │   └── client.ts
│   ├── cache/               # KV 缓存客户端
│   │   └── client.ts
│   ├── errors/              # 错误处理系统
│   │   └── index.ts        # 错误类型和处理
│   └── logger/              # 日志系统
│       └── index.ts        # 轻量级日志记录器
├── prisma/                   # Prisma 配置
│   └── schema.prisma        # 数据库模型定义
├── migrations/               # 数据库迁移文件
│   └── 0001_init.sql
├── types/                    # TypeScript 类型定义
│   └── cloudflare.d.ts
├── wrangler.toml             # 本地环境配置
├── wrangler.test.toml        # 测试环境配置
└── wrangler.prod.toml        # 生产环境配置
```

## 核心功能

### 1. Prisma ORM 集成

- Prisma 负责类型安全查询，迁移由 Wrangler D1 管理
- 客户端在 Edge Runtime 中通过单例模式复用，避免重复初始化
- Schema、适配器与连接复用细节参见 [数据库迁移指南](./MIGRATIONS-zh.md) 与 [Repository 模式指南](./REPOSITORY-zh.md)

### 2. Repository 模式

- 数据访问逻辑集中在 `repositories/*`，API 层专注验证与业务流程
- `withRepositories` 负责创建 Prisma 客户端、注入仓储并统一错误处理
- 完整示例与测试策略见 [REPOSITORY-zh.md](./REPOSITORY-zh.md)

### 3. 统一错误处理系统

#### 错误分类（`lib/errors/index.ts`）

- 数据库错误：DatabaseError, DatabaseConnectionError, DatabaseQueryError
- 文件错误：FileError, FileUploadError, FileNotFoundError
- 转换错误：ConversionError, JSONParseError, TypeConversionError
- 验证错误：ValidationError, InvalidInputError, MissingRequiredFieldError
- 认证授权：AuthenticationError, AuthorizationError, TokenExpiredError
- 资源错误：ResourceNotFoundError, ResourceAlreadyExistsError
- 业务逻辑：BusinessLogicError
- 外部服务：ExternalServiceError, APIError, NetworkError

#### 使用示例

```typescript
import { ValidationError, DatabaseConnectionError } from '@/lib/errors';

// 抛出验证错误
if (!email) {
  throw new ValidationError('Email is required');
}

// 抛出数据库连接错误
if (!db) {
  throw new DatabaseConnectionError('Database not available');
}
```

### 4. 轻量级日志系统

#### 特性（`lib/logger/index.ts`）

- 适用于 Cloudflare Workers Edge Runtime
- 多级别：ERROR, WARN, INFO, DEBUG
- 支持上下文与元数据
- 自动时间戳

#### 使用示例

```typescript
import { logger, LoggerFactory } from '@/lib/logger';

// 默认日志记录器
logger.info('Server started');
logger.error('Failed to connect', error, { userId: 123 });

// 带上下文的日志记录器
const apiLogger = LoggerFactory.getLogger('api');
apiLogger.info('Request received', { path: '/api/users' });
```

### 5. 统一 API 响应格式

#### 成功响应

```typescript
{
  success: true,
  data: T,
  message?: string,
  meta?: { page?: number; limit?: number; total?: number }
}
```

#### 错误响应

```typescript
{
  success: false,
  error: {
    type: ErrorType,
    message: string,
    details?: unknown,
    stack?: string // 仅非生产
  }
}
```

#### 使用示例

```typescript
import { successResponse, createdResponse, errorResponse, paginatedResponse } from '@/lib/api';

// 成功
return successResponse(user, 'User retrieved successfully');

// 创建（201）
return createdResponse(user, 'User created successfully');

// 分页
return paginatedResponse(posts, page, limit, total);
```

### 6. 请求日志中间件

#### 功能（`lib/api/middleware.ts`）

- 自动记录所有 API 请求
- 生成唯一请求 ID
- 记录方法、URL、响应时间
- 自动错误日志

#### 使用示例

```typescript
import { withMiddleware } from '@/lib/api';

export async function GET(request: NextRequest) {
  return withMiddleware(request, async () => {
    // 你的 API 逻辑
    const data = await fetchData();
    return successResponse(data);
  });
}
```

### 7. API 路由示例

#### 健康检查（`/api/health`）

- GET：返回系统健康状态
- 检查 D1、R2、KV 可用性

#### 用户（`/api/users`）

- GET：获取所有用户（带缓存）
- POST：创建新用户（带验证）
- GET `/api/users/[id]`：获取单个用户
- PATCH `/api/users/[id]`：更新用户
- DELETE `/api/users/[id]`：删除用户

#### 文章（`/api/posts`）

- GET：获取所有文章（支持分页/过滤）
- POST：创建新文章
- GET `/api/posts/[id]`：获取单个文章
- PATCH `/api/posts/[id]`：更新文章
- DELETE `/api/posts/[id]`：删除文章

#### 上传（`/api/upload`）

- POST：上传文件至 R2（限制大小）
- GET：下载文件

## 环境配置

### 三个环境

1. **Local（本地）** - `wrangler.toml`
   - 本地开发与测试
   - 使用 `--local` 运行
2. **Test（测试）** - `wrangler.test.toml`
   - 测试环境部署
   - 从 `develop` 分支自动部署
3. **Production（生产）** - `wrangler.prod.toml`
   - 生产环境部署
   - 从 `main` 分支自动部署

### 环境命令

命令、绑定与密钥细节见：

- 数据库、迁移与 Prisma：参见 [数据库迁移指南](./MIGRATIONS-zh.md)
- R2 / KV 资源创建：参见 [快速开始](../QUICKSTART-zh.md) 与 [环境说明](./ENVIRONMENTS-zh.md)
- 本地开发、测试与部署：参见 [开发指南](./DEVELOPMENT-zh.md) 与 [部署指南](./DEPLOYMENT-zh.md)

## 开发工作流

主线：本地调试 → 编写/同步迁移 → 通过测试 → 部署。要求：

1. 新功能沿用 Repository 与统一响应体系，确保 Edge 一致性
2. 部署前完成迁移、测试与构建校验（见开发/部署指南）

## 最佳实践

### 1. 错误处理

- 使用类型化错误类
- 在路由中抛错，由中间件统一处理
- 错误消息提供上下文

### 2. 日志记录

- 使用 LoggerFactory 按模块划分
- 在错误处理中记录细节
- 生产使用 INFO，开发使用 DEBUG

### 3. 数据库操作

- 优先使用 Repository
- 利用 Prisma 类型安全
- 复杂操作使用事务
- 充分使用关系查询

**示例：**

```typescript
// ✅ 推荐：使用 Repository
return withRepositories(request, async repos => {
  const users = await repos.users.findAll();
  return successResponse(users);
});

// ❌ 不推荐：直接使用 Prisma（绕过统一错误处理）
const prisma = createPrismaClient();
const users = await prisma.user.findMany();
```

### 4. 缓存策略

- 对热点数据使用 KV 缓存
- 使用 `withCache`
- 数据更新时清理相关缓存

### 5. API 设计

- 统一响应格式
- 参数与输入验证
- 分页端点提供 page/limit
- 返回有意义的状态码

## 性能优化

1. Edge Runtime：所有 API 路由运行在边缘
2. 缓存：KV 存储热点数据
3. 连接复用：Prisma 单例节省 ~50–100ms
4. 查询优化：Prisma 高效生成查询
5. 并行处理：尽可能使用 Promise.all
6. Repository 模式：统一数据访问，减少重复

## 安全性

1. 输入验证
2. 错误消息不泄露敏感信息（生产）
3. 类型安全（TypeScript）
4. 环境隔离（local/test/prod）
5. 认证授权类型可直接集成

## 故障排查

### 常见问题

1. Prisma Client 未生成

   ```bash
   pnpm prisma:generate
   ```

2. 数据库迁移失败
   - 检查 SQL 语法
   - 确认数据库 ID 已配置

3. TypeScript 类型错误

   ```bash
   pnpm type-check
   ```

4. API 返回 503
   - 检查 Cloudflare 绑定名称
   - 验证环境变量是否正确

## 扩展指南

### 新增错误类型

1. 在 `lib/errors/index.ts` 定义新的错误类
2. 将错误类型加入 `ErrorType` 枚举
3. 更新 `ERROR_STATUS_MAP` 映射

### 新增日志级别

1. 修改 `lib/logger/index.ts` 中的 `LogLevel`
2. 更新 `LOG_LEVEL_PRIORITY`
3. 补充对应的日志方法

### 集成第三方服务

1. 在 `lib/` 下创建新的客户端
2. 统一使用错误处理体系
3. 补充必要的类型定义
4. 在 API 路由中提供使用示例

## 总结

本项目提供了企业级的 Next.js + Cloudflare 应用架构，包含：

- ✅ Prisma ORM 抽象（单例复用）
- ✅ Repository 模式（数据访问与业务逻辑分离）
- ✅ 统一错误分类与处理
- ✅ 轻量级日志系统
- ✅ 统一 API 响应格式
- ✅ 自动请求日志
- ✅ 完整 CRUD 示例
- ✅ 三环境配置（local/test/prod）
- ✅ 类型安全与测试覆盖

所有组件模块化、可扩展，便于适配不同业务需求。
**示例：**

```typescript
// ✅ 推荐：使用 Repository
return withRepositories(request, async repos => {
  const users = await repos.users.findAll();
  return successResponse(users);
});

// ❌ 不推荐：直接使用 Prisma（绕过统一错误处理）
const prisma = createPrismaClient();
const users = await prisma.user.findMany();
```
