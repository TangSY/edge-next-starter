/**
 * 用户注册 API
 * 处理新用户注册请求
 *
 * 注意：使用 Node.js 运行时以支持 bcryptjs 密码加密
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

// 使用 Node.js 运行时（bcryptjs 需要）
export const runtime = 'nodejs';

// 注册请求验证 schema
const registerSchema = z.object({
  email: z.string().email('请提供有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要 8 个字符'),
  name: z.string().min(1, '请提供用户名').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = registerSchema.parse(body);

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    // 加密密码
    const hashedPassword = await hash(validatedData.password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || validatedData.email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: '注册成功',
        user: {
          ...user,
          createdAt: new Date(user.createdAt * 1000).toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json({ error: firstError?.message || '验证失败' }, { status: 400 });
    }

    console.error('注册错误:', error);
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
  }
}
