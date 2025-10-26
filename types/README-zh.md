# 类型定义目录

本目录包含项目中所有的 TypeScript 类型定义，按职责分离组织。

## 文件结构

```
types/
├── index.ts          # 统一导出入口
├── cloudflare.d.ts   # Cloudflare 环境和绑定类型
├── api.ts            # API 相关类型
└── rate-limit.ts     # 速率限制类型
```

## 类型文件说明

### `cloudflare.d.ts`

Cloudflare Workers 环境特定的类型定义，包括：

- `CloudflareEnv` - Cloudflare 绑定接口（D1、R2、KV等）
- 全局类型扩展（`NodeJS.ProcessEnv`, `EdgeRuntime`, `Deno`）

**使用场景**：

- 定义 Cloudflare 环境变量和绑定
- 类型检查 `process.env` 中的 Cloudflare 特定属性
- 检测运行时环境（Edge Runtime / Node.js）

### `api.ts`

API 层相关的类型定义，包括：

- `RequestContext` - API 请求上下文
- `PaginationParams` - 分页参数
- `PaginationMeta` - 分页元数据
- `ApiErrorDetail` - API 错误详情

**使用场景**：

- 定义 API 请求/响应结构
- 实现分页功能
- 标准化错误响应格式

### `rate-limit.ts`

速率限制相关的类型定义，包括：

- `RateLimitConfig` - 速率限制配置
- `RateLimitStatus` - 速率限制状态

**使用场景**：

- 配置 API 速率限制
- 查询当前速率限制状态
- 自定义速率限制规则

### `index.ts`

统一导出所有类型定义，提供便捷的导入方式。

## 使用方式

### 单独导入特定类型

```typescript
// 只导入 Cloudflare 相关类型
import { CloudflareEnv } from '@/types/cloudflare';

// 只导入 API 相关类型
import { PaginationParams, PaginationMeta } from '@/types/api';

// 只导入速率限制类型
import { RateLimitConfig, RateLimitStatus } from '@/types/rate-limit';
```

### 通过统一入口导入

```typescript
// 从统一入口导入多个类型
import { CloudflareEnv, PaginationParams, RateLimitConfig } from '@/types';
```

## 设计原则

### 1. 职责分离

每个类型文件只包含相关领域的类型定义：

- ✅ `cloudflare.d.ts` 只包含 Cloudflare 平台相关类型
- ✅ `api.ts` 只包含 API 层通用类型
- ✅ `rate-limit.ts` 只包含速率限制功能类型

### 2. 按需导入

- 可以按需导入特定模块的类型，减少不必要的依赖
- 避免循环依赖问题

### 3. 便于维护

- 类型定义集中在一处，易于查找和修改
- 清晰的文件组织，便于团队协作

## 添加新类型

### 判断应该放在哪个文件

1. **Cloudflare 平台相关** → `cloudflare.d.ts`
   - 示例：新的 Cloudflare 绑定、环境变量

2. **API 通用功能** → `api.ts`
   - 示例：请求/响应格式、通用中间件类型

3. **特定功能模块** → 创建新文件
   - 示例：`auth.ts`（认证相关）、`cache.ts`（缓存相关）

### 添加新类型文件的步骤

1. 在 `types/` 目录创建新文件
2. 定义类型并添加详细注释
3. 在 `types/index.ts` 中导出新类型
4. 更新此 README 文档

## 最佳实践

### 1. 类型命名规范

```typescript
// ✅ 使用 PascalCase 命名接口/类型
export interface UserProfile {}
export type RequestStatus = 'pending' | 'success' | 'error';

// ✅ 配置类型以 Config 结尾
export interface RateLimitConfig {}

// ✅ 状态类型以 Status 或 State 结尾
export interface RateLimitStatus {}

// ✅ 参数类型以 Params 结尾
export interface PaginationParams {}
```

### 2. 添加详细注释

```typescript
/**
 * 速率限制配置类型
 * 用于配置 API 端点的速率限制规则
 */
export interface RateLimitConfig {
  /** 时间窗口内最大请求数 */
  maxRequests: number;

  /** 时间窗口（秒） */
  windowSeconds: number;

  /** KV 存储键前缀，用于隔离不同应用的数据 */
  keyPrefix?: string;

  /** 跳过速率限制的路径列表 */
  skipPaths?: string[];
}
```

### 3. 使用类型而非接口（当适用时）

```typescript
// ✅ 简单的联合类型使用 type
export type Environment = 'local' | 'test' | 'production';

// ✅ 对象结构使用 interface（便于扩展）
export interface CloudflareEnv {
  DB: D1Database;
  KV: KVNamespace;
}
```

### 4. 避免过度泛化

```typescript
// ❌ 避免：过度泛化的类型
export interface GenericResponse<T> {
  data: T;
  meta: any;
  status: any;
}

// ✅ 推荐：明确的类型定义
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}
```

## 相关文档

- [TypeScript 类型系统](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Cloudflare Workers Types](https://github.com/cloudflare/workers-types)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
