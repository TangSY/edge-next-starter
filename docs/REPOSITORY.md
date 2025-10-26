# Repository Pattern Guide

## Overview

This project uses the **Repository pattern** to separate data access from business logic, improving maintainability and testability.

Repositories live at the project root as domain components.

## Layered Architecture

```
API Routes (app/api/*)
    ↓ business logic + validation
Repository layer (repositories/*)
    ↓ database ops + exception handling
Prisma Client (lib/db/client.ts)
    ↓
D1 Database
```

### Responsibilities

| Layer          | Responsibilities                                                   | Should not do                                 |
| -------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| **API Routes** | • Parse requests • business logic • validation • cache • responses | • Write SQL directly • manage connections     |
| **Repository** | • DB CRUD • query building • DB exception handling • data mapping  | • business validation • complex logic • cache |

## Directory

```
repositories/
├── index.ts                 # Repository factory and exports
├── user.repository.ts       # User data operations
└── post.repository.ts       # Post data operations

lib/db/
└── client.ts                # Prisma client (singleton)
```

## Repository Example

### Create a Repository

```typescript
// repositories/user.repository.ts
import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find all users
   * DB only, no business logic
   */
  async findAll(orderBy: 'asc' | 'desc' = 'desc') {
    try {
      return await this.prisma.user.findMany({
        orderBy: { createdAt: orderBy },
      });
    } catch (error) {
      // Unified exception handling
      throw new DatabaseQueryError('Failed to fetch users', error);
    }
  }

  /**
   * Check if email exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email },
      });
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to check email existence`, error);
    }
  }

  // More methods...
}
```

### Use in API Route

```typescript
// app/api/users/route.ts
import { withRepositories } from '@/lib/api';

export async function POST(request: NextRequest) {
  return withRepositories(request, async repos => {
    // 1. Parse request
    const body = await request.json();
    const { email, name } = body;

    // 2. Business: validation
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // 3. Business: check duplicates
    const exists = await repos.users.existsByEmail(email);
    if (exists) {
      throw new ResourceAlreadyExistsError('User with this email');
    }

    // 4. DB ops via Repository
    const user = await repos.users.create({ email, name });

    // 5. Business: cache management
    const cache = createCacheClient();
    await cache?.delete('users:all');

    return createdResponse(user, 'User created successfully');
  });
}
```

## Naming Conventions

### Query methods

```typescript
// Query one
findById(id: number)
findByEmail(email: string)

// Query many
findAll(options?)
findByUserId(userId: number)

// With relations
findByIdWithPosts(id: number)

// Existence checks
exists(id: number): Promise<boolean>
existsByEmail(email: string): Promise<boolean>

// Counts
count(options?): Promise<number>
```

### Mutation methods

```typescript
// Create
create(data: CreateData)

// Update
update(id: number, data: UpdateData)

// Delete
delete(id: number)

// Specific operations
publish(id: number)      // publish post
unpublish(id: number)    // unpublish post
```

## Exception Handling

### Repository layer

Repository only throws database-related exceptions:

```typescript
async findById(id: number) {
  try {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    // Catch DB error → app error
    throw new DatabaseQueryError(
      `Failed to fetch user with id ${id}`,
      error
    );
  }
}
```

### API route layer

API routes handle business logic exceptions:

```typescript
// Business validation error
if (!email) {
  throw new ValidationError('Email is required');
}

// Resource not found
if (!user) {
  throw new ResourceNotFoundError('User');
}

// Resource conflict
if (exists) {
  throw new ResourceAlreadyExistsError('User with this email');
}
```

## Data Mapping

Repository may do simple data mapping, not complex business logic:

```typescript
// ✅ Good: simple format conversion
async create(data: { email: string; name?: string }) {
  return await this.prisma.user.create({
    data: {
      email: data.email,
      name: data.name || null,  // simple mapping
    },
  });
}

// ❌ Bad: complex business logic
async create(data: { email: string; name?: string }) {
  // ❌ Validation should be in the API layer
  if (!this.isValidEmail(data.email)) {
    throw new ValidationError('Invalid email');
  }

  // ❌ Business rules should be in the API layer
  const isPremium = this.calculateUserTier(data);

  return await this.prisma.user.create({
    data: { ...data, isPremium },
  });
}
```

## Using a Repository Factory

Repository Factory provides a unified access entry:

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

## withRepositories Wrapper

To reduce boilerplate, the project provides a `withRepositories` wrapper:

```typescript
// lib/api/database.ts
export async function withRepositories<T>(
  request: NextRequest,
  handler: (repos: RepositoryFactory) => Promise<NextResponse<T>>
): Promise<NextResponse<T>>;
```

### DB Connection Reuse

**Important:** `withRepositories` uses a Prisma client singleton internally:

```typescript
// lib/db/client.ts
let prismaClient: PrismaClient | null = null;

export function createPrismaClient(): PrismaClient | null {
  // If instance exists, reuse it
  if (prismaClient) {
    return prismaClient;
  }

  // Create new instance and cache
  prismaClient = new PrismaClient({ adapter });
  return prismaClient;
}
```

**Why?**

In Cloudflare Workers Edge Runtime:

1. Each isolate has an independent global scope
2. Requests within the same isolate reuse a single PrismaClient instance
3. Avoids creating a new connection per request (big performance gain)
4. D1 adapter manages underlying connections; no manual pool

**Performance:**

- ❌ Old: create PrismaClient per request → ~50‑100ms
- ✅ New: reuse PrismaClient → ~0‑5ms

### Advantages

1. **Auto init**: creates Prisma client + Repository factory
2. **Reuse connections**: singleton PrismaClient avoids re‑creation
3. **Unified errors**: handle DB connection errors centrally
4. **Less boilerplate**: no per‑route initialization
5. **Type safety**: full TypeScript support
6. **Middleware**: auto request logging + error handling

### Usage example

```typescript
// ❌ Old: manual init
export async function GET(request: NextRequest) {
  return withMiddleware(request, async () => {
    const prisma = createPrismaClient();
    if (!prisma) {
      throw new DatabaseConnectionError('Database not available');
    }
    const repos = createRepositories(prisma);

    const users = await repos.users.findAll();
    return successResponse(users);
  });
}

// ✅ New: use withRepositories
export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    const users = await repos.users.findAll();
    return successResponse(users);
  });
}
```

### Complete example

```typescript
// app/api/posts/route.ts
import { withRepositories, paginatedResponse } from '@/lib/api';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Business validation
    if (page < 1 || limit < 1 || limit > 100) {
      throw new ValidationError('Invalid pagination parameters');
    }

    // Database operations
    const [posts, total] = await Promise.all([
      repos.posts.findAll({ skip: (page - 1) * limit, take: limit }),
      repos.posts.count(),
    ]);

    return paginatedResponse(posts, page, limit, total);
  });
}
```

## Testing

Repository pattern makes testing easier:

```typescript
// Easily mock a Repository
const mockUserRepo = {
  findById: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
  create: jest.fn(),
};

// API route tests don’t require a real DB
```

## Best Practices

### ✅ Good practices

1. **Single responsibility**: one entity per Repository
2. **Unified exceptions**: convert DB errors to app errors
3. **Type safety**: leverage Prisma’s typing
4. **Clear comments**: document methods clearly
5. **Return full objects**: include relations when needed

```typescript
// ✅ Good
async findById(id: number) {
  try {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,  // include relations
      },
    });
  } catch (error) {
    throw new DatabaseQueryError(`Failed to fetch user`, error);
  }
}
```

### ❌ Avoid

1. **Business logic**: don’t validate rules in Repository
2. **External deps**: don’t call external services or APIs
3. **Complex compute**: don’t do heavy calculations
4. **Cache management**: don’t handle cache here

```typescript
// ❌ Bad
async create(data) {
  // ❌ Don’t validate here
  if (!this.isValidEmail(data.email)) {
    throw new ValidationError();
  }

  // ❌ Don’t call external services
  await this.sendWelcomeEmail(data.email);

  // ❌ Don’t manage cache here
  await this.cache.delete('users');

  return await this.prisma.user.create({ data });
}
```

## Extending Repositories

Add a new Repository:

```typescript
// 1. Create Repository class
// repositories/comment.repository.ts
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

// 2. Register in Factory
// repositories/index.ts
export class RepositoryFactory {
  get comments(): CommentRepository {
    return new CommentRepository(this.prisma);
  }
}

// 3. Export
export { CommentRepository } from './comment.repository';

// 4. Use
const repos = createRepositories(prisma);
const comments = await repos.comments.findAll();
```

## Summary

Core principles of the Repository pattern:

1. 📦 **Encapsulate data access**: all DB ops via Repositories
2. 🎯 **Single responsibility**: Repositories only handle data
3. 🚫 **No business logic**: handled at API layer
4. ⚠️ **Unified exceptions**: DB errors → app errors
5. 🧪 **Easy to test**: easily mock and test

Following these principles keeps code clean and maintainable!
