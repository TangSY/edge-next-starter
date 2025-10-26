# Types Directory

This directory contains all TypeScript type definitions organized by responsibility.

## File Structure

```
types/
├── index.ts          # 统一导出入口
├── cloudflare.d.ts   # Cloudflare 环境和绑定类型
├── api.ts            # API 相关类型
└── rate-limit.ts     # 速率限制类型
```

## Type Files

### `cloudflare.d.ts`

Cloudflare Workers environment‑specific types, including:

- `CloudflareEnv` — Cloudflare bindings (D1, R2, KV)
- Global extensions (`NodeJS.ProcessEnv`, `EdgeRuntime`, `Deno`)

**Use cases**:

- Define Cloudflare env vars and bindings
- Type‑check Cloudflare‑specific `process.env`
- Detect runtime (Edge Runtime / Node.js)

### `api.ts`

API layer types, including:

- `RequestContext` — API request context
- `PaginationParams` — pagination params
- `PaginationMeta` — pagination metadata
- `ApiErrorDetail` — API error detail

**Use cases**:

- Define API request/response
- Implement pagination
- Standardize error response format

### `rate-limit.ts`

Rate limit types, including:

- `RateLimitConfig` — configuration
- `RateLimitStatus` — status

**Use cases**:

- Configure API rate limit
- Query current status
- Customize rules

### `index.ts`

Unified exports for convenient imports.

## Usage

### Import specific types

```typescript
// Only Cloudflare types
import { CloudflareEnv } from '@/types/cloudflare';

// Only API types
import { PaginationParams, PaginationMeta } from '@/types/api';

// Only rate limit types
import { RateLimitConfig, RateLimitStatus } from '@/types/rate-limit';
```

### Import via unified index

```typescript
// 从统一入口导入多个类型
import { CloudflareEnv, PaginationParams, RateLimitConfig } from '@/types';
```

## Design Principles

### 1. Separation of concerns

Each file contains types related to its domain:

- ✅ `cloudflare.d.ts` — Cloudflare platform types
- ✅ `api.ts` — API layer types
- ✅ `rate-limit.ts` — Rate limit types

### 2. Import as needed

- Import only what you need to reduce dependencies
- Avoid cyclic dependencies

### 3. Maintainable

- Centralized definitions for easy discovery and changes
- Clear structure for team collaboration

## Adding New Types

### Decide which file

1. **Cloudflare platform** → `cloudflare.d.ts`
   - Example: new Cloudflare bindings, env vars

2. **API common** → `api.ts`
   - Example: request/response, middleware types

3. **Specific modules** → new file
   - Example: `auth.ts` (auth), `cache.ts` (cache)

### Steps

1. Create a new file under `types/`
2. Define types with comments
3. Export in `types/index.ts`
4. Update this README

## Best Practices

### 1. Naming

```typescript
// ✅ Use PascalCase for interfaces/types
export interface UserProfile {}
export type RequestStatus = 'pending' | 'success' | 'error';

// ✅ Config types end with Config
export interface RateLimitConfig {}

// ✅ Status types end with Status or State
export interface RateLimitStatus {}

// ✅ Param types end with Params
export interface PaginationParams {}
```

### 2. Add detailed comments

```typescript
/**
 * Rate limit configuration type
 * Used to configure API endpoint rate limit rules
 */
export interface RateLimitConfig {
  /** Max requests within window */
  maxRequests: number;

  /** Window in seconds */
  windowSeconds: number;

  /** KV key prefix to isolate apps */
  keyPrefix?: string;

  /** Paths to skip rate limiting */
  skipPaths?: string[];
}
```

### 3. Use type vs interface (when appropriate)

```typescript
// ✅ Use type for simple unions
export type Environment = 'local' | 'test' | 'production';

// ✅ Use interface for object shapes (extensible)
export interface CloudflareEnv {
  DB: D1Database;
  KV: KVNamespace;
}
```

### 4. Avoid over‑generic types

```typescript
// ❌ Avoid overly generic types
export interface GenericResponse<T> {
  data: T;
  meta: any;
  status: any;
}

// ✅ Prefer explicit types
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

## References

- [TypeScript Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Cloudflare Workers Types](https://github.com/cloudflare/workers-types)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
