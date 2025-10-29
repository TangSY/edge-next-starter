/**
 * Prisma Client 实例
 * 用于认证和其他需要直接访问数据库的场景
 */

import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// 在 Cloudflare Workers Edge Runtime 中
// 检查是否有 D1 binding
const getD1Database = (): D1Database | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = process.env as any;
    return env.DB || null;
  } catch {
    return null;
  }
};

const db = getD1Database();

if (db) {
  // 生产环境：使用 D1 adapter
  const adapter = new PrismaD1(db);
  prisma = new PrismaClient({ adapter });
} else {
  // 本地开发环境：使用文件数据库
  // 复用全局实例避免热重载时创建多个连接
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}

export { prisma };
