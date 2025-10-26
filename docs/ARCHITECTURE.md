# Architecture

## Overview

This project is a Next.js + Cloudflare full‑stack template with enterprise‑grade architecture features.

## Diagram

```mermaid
graph TD
  A[Client] -->|HTTPS| B[Cloudflare Pages Edge Network]
  B --> C[Next.js App Router (Edge Runtime)]
  C --> D[API Middleware<br/>Logging & Error Handling]
  D --> E[Repository Factory]
  E --> F[Prisma Client<br/>(D1 Adapter)]
  F --> G[(Cloudflare D1)]
  E --> H[(Cloudflare R2 Bucket)]
  D --> I[(Cloudflare KV Namespace)]
  C --> J[Static Assets / Page Rendering]
  subgraph CI/CD
    K[GitHub Actions
CI Workflow]
    L[GitHub Actions
Deploy Workflow]
  end
  K --> L --> B
```

**Data flow**:

- Requests pass Cloudflare Pages’ global network to the Next.js app on Edge Runtime.
- API routes go through middleware (logging, errors, rate limiting); repositories access D1, R2, KV.
- CI handles tests/builds; deploy workflow publishes to Pages after verification.

## Stack

### Core

- **Next.js 15.5.2** — React with App Router
- **Cloudflare Pages** — Edge Runtime platform
- **TypeScript** — Typed JavaScript

### Data Layer

- **Prisma** — ORM with type‑safe DB access
- **D1 Database** — Cloudflare edge DB (SQLite)
- **R2 Storage** — Object storage
- **KV Storage** — Key‑value cache

### Tooling

- **pnpm** — Package manager
- **Vitest** — Testing framework
- **ESLint + Prettier** — Lint and format

## Structure

```
cloudflare-worker-template/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── health/          # Health API
│   │   ├── users/           # User CRUD API
│   │   │   └── [id]/       # Single‑user ops
│   │   ├── posts/           # Post CRUD API
│   │   │   └── [id]/       # Single‑post ops
│   │   └── upload/          # Upload API
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── repositories/             # Data access layer (Repository)
│   ├── index.ts             # Repository factory/exports
│   ├── user.repository.ts   # User data ops
│   └── post.repository.ts   # Post data ops
├── lib/                      # Core libraries
│   ├── api/                 # API utilities
│   │   ├── response.ts     # Unified response format
│   │   ├── middleware.ts   # Request logging middleware
│   │   ├── database.ts     # DB access wrapper
│   │   └── index.ts        # Entry exports
│   ├── db/                  # DB client
│   │   └── client.ts       # Prisma + D1 (singleton)
│   ├── r2/                  # R2 client
│   │   └── client.ts
│   ├── cache/               # KV cache client
│   │   └── client.ts
│   ├── errors/              # Error system
│   │   └── index.ts        # Error types and handling
│   └── logger/              # Logger
│       └── index.ts        # Lightweight logger
├── prisma/                   # Prisma config
│   └── schema.prisma        # DB models
├── migrations/               # DB migrations
│   └── 0001_init.sql
├── types/                    # TypeScript types
│   └── cloudflare.d.ts
├── wrangler.toml             # Local env config
├── wrangler.test.toml        # Test env config
└── wrangler.prod.toml        # Prod env config
```

## Core Capabilities

### 1. Prisma ORM

- Prisma handles type‑safe queries; migrations are managed via Wrangler D1
- Client reuse via singleton in Edge Runtime
- See [Migrations](./MIGRATIONS.md) and [Repository](./REPOSITORY.md)

### 2. Repository Pattern

- Data access centralized in `repositories/*`; API focuses on validation and flow
- `withRepositories` creates Prisma client, injects repos, and unifies error handling
- Examples and tests: [REPOSITORY.md](./REPOSITORY.md)

### 3. Unified Error Handling

#### Categories (`lib/errors/index.ts`)

- **Database**: DatabaseError, DatabaseConnectionError, DatabaseQueryError
- **File**: FileError, FileUploadError, FileNotFoundError
- **Conversion**: ConversionError, JSONParseError, TypeConversionError
- **Validation**: ValidationError, InvalidInputError, MissingRequiredFieldError
- **Auth**: AuthenticationError, AuthorizationError, TokenExpiredError
- **Resource**: ResourceNotFoundError, ResourceAlreadyExistsError
- **Business**: BusinessLogicError
- **External**: ExternalServiceError, APIError, NetworkError

#### Usage

```typescript
import { ValidationError, DatabaseConnectionError } from '@/lib/errors';

// Throw validation error
if (!email) {
  throw new ValidationError('Email is required');
}

// Throw DB connection error
if (!db) {
  throw new DatabaseConnectionError('Database not available');
}
```

### 4. Lightweight Logging

#### Features (`lib/logger/index.ts`)

- Works on Cloudflare Workers Edge Runtime
- Levels: ERROR, WARN, INFO, DEBUG
- Supports context and metadata
- Auto timestamps

#### Usage

```typescript
import { logger, LoggerFactory } from '@/lib/logger';

// Default logger
logger.info('Server started');
logger.error('Failed to connect', error, { userId: 123 });

// Contextual logger
const apiLogger = LoggerFactory.getLogger('api');
apiLogger.info('Request received', { path: '/api/users' });
```

### 5. Unified API Responses

#### Success format

```typescript
{
  success: true,
  data: T,
  message?: string,
  meta?: {
    page?: number,
    limit?: number,
    total?: number
  }
}
```

#### Error format

```typescript
{
  success: false,
  error: {
    type: ErrorType,
    message: string,
    details?: unknown,
    stack?: string  // only in non-production
  }
}
```

#### Usage

```typescript
import { successResponse, createdResponse, errorResponse, paginatedResponse } from '@/lib/api';

// Success response
return successResponse(user, 'User retrieved successfully');

// Created (201)
return createdResponse(user, 'User created successfully');

// Paginated response
return paginatedResponse(posts, page, limit, total);
```

### 6. Request Logging Middleware

#### Features (`lib/api/middleware.ts`)

- Auto‑log all API requests
- Generate unique request IDs
- Record method, URL, response time
- Auto error logging

#### Usage

```typescript
import { withMiddleware } from '@/lib/api';

export async function GET(request: NextRequest) {
  return withMiddleware(request, async () => {
    // Your API logic
    const data = await fetchData();
    return successResponse(data);
  });
}
```

### 7. API Route Examples

#### Health (`/api/health`)

- GET: returns system health
- Checks D1, R2, KV availability

#### Users (`/api/users`)

- GET: list users (with cache)
- POST: create user (with validation)
- GET `/api/users/[id]`: get one user
- PATCH `/api/users/[id]`: update user
- DELETE `/api/users/[id]`: delete user

#### Posts (`/api/posts`)

- GET: list posts (with pagination/filters)
- POST: create post
- GET `/api/posts/[id]`: get one post
- PATCH `/api/posts/[id]`: update post
- DELETE `/api/posts/[id]`: delete post

#### Upload (`/api/upload`)

- POST: upload file to R2 (with size limits)
- GET: download file

## Environments

### Three environments

1. **Local** — `wrangler.toml`
   - for local development/testing
   - run with `--local`

2. **Test** — `wrangler.test.toml`
   - test deployments
   - auto‑deploy from `develop`

3. **Production** — `wrangler.prod.toml`
   - production deployments
   - auto‑deploy from `main`

### Environment commands

Commands, binding names, and secrets are covered in dedicated docs:

- Database, migrations and Prisma: see [Migrations](./MIGRATIONS.md)
- R2 / KV resources: see [Quick Start](../QUICKSTART.md) and [Environments](./ENVIRONMENTS.md)
- Local development, testing and deployment: see [Development](./DEVELOPMENT.md) and [Deployment](./DEPLOYMENT.md)

## Development Workflow

Workflow: debug locally → write/sync migrations → pass tests → deploy. Architecture requires:

1. Follow repository + unified responses for Edge consistency
2. Complete migrations, tests and build checks (see Development/Deployment)

## Best Practices

### 1. Error Handling

- Use typed errors
- Throw in routes; middleware handles
- Provide meaningful messages and context

### 2. Logging

- Use LoggerFactory per module
- Log details in error handling
- INFO in prod; DEBUG in dev

### 3. Database

- Prefer repositories
- Prisma for type safety
- Transactions for complex ops
- Use Prisma relations

**Example:**

```typescript
// ✅ Recommended: use Repository
return withRepositories(request, async repos => {
  const users = await repos.users.findAll();
  return successResponse(users);
});

// ❌ Not recommended: direct Prisma (bypasses unified errors)
const prisma = createPrismaClient();
const users = await prisma.user.findMany();
```

### 4. Caching

- Cache hot data in KV
- Use `withCache`
- Clear cache on updates

### 5. API Design

- Use unified responses
- Implement validation
- Provide page/limit
- Return meaningful status codes

## Performance

1. **Edge Runtime**: all routes on Cloudflare Edge
2. **Cache**: KV for hot data
3. **Connection reuse**: Prisma singleton (~50–100ms saved)
4. **DB queries**: Prisma’s efficient queries
5. **Parallel**: Promise.all where possible
6. **Repository**: unified data access

## Security

1. **Input validation**
2. **Error messages**: avoid sensitive info in prod
3. **Type safety**: TypeScript checks
4. **Isolation**: separate env configs
5. **Auth**: error types reserved for integration

## Troubleshooting

### Common Issues

1. **Prisma Client not generated**

   ```bash
   pnpm prisma:generate
   ```

2. **Database migration failed**
   - Check SQL syntax
   - Ensure the database ID is set

3. **Type errors**

   ```bash
   pnpm type-check
   ```

4. **API returns 503**
   - Check Cloudflare bindings
   - Validate environment variables

## Extensions

### Add new error types

1. Define a new error class in `lib/errors/index.ts`
2. Add to the `ErrorType` enum
3. Update `ERROR_STATUS_MAP`

### Add new log levels

1. Modify `LogLevel` in `lib/logger/index.ts`
2. Update `LOG_LEVEL_PRIORITY`
3. Add log methods

### Integrate third‑party services

1. Create a new client under `lib/`
2. Use unified error handling
3. Add required types
4. Provide API route examples

## Summary

This project provides a complete enterprise‑grade Next.js + Cloudflare architecture, including:

- ✅ Prisma ORM abstraction (singleton)
- ✅ Repository pattern (separate data/business)
- ✅ Unified error handling
- ✅ Lightweight logging
- ✅ Unified API responses
- ✅ Auto request logging
- ✅ Complete CRUD examples
- ✅ Three environments (local/test/prod)
- ✅ Type safety and test coverage

All components are modular and extensible, easy to adapt to business needs.
