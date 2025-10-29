/**
 * NextAuth API 路由处理器
 * 处理所有认证相关的 API 请求
 *
 * 注意：使用 Node.js 运行时以支持 bcryptjs 密码加密
 */

import { handlers } from '@/auth';

// 使用 Node.js 运行时（bcryptjs 需要）
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
