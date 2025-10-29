/**
 * NextAuth Prisma 适配器
 * 用于将 NextAuth 与 Prisma + Cloudflare D1 集成
 *
 * 注意：NextAuth 期望 ID 是 string 类型，但 D1 使用 integer
 * 此适配器处理 ID 类型转换（string <-> number）
 */

import { PrismaClient } from '@prisma/client';
import type { Adapter } from 'next-auth/adapters';

export function PrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified
            ? Math.floor(data.emailVerified.getTime() / 1000)
            : null,
        },
      });
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified * 1000) : null,
      };
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) return null;
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified * 1000) : null,
      };
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified * 1000) : null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });
      if (!account) return null;
      return {
        id: account.user.id.toString(),
        email: account.user.email,
        name: account.user.name,
        image: account.user.image,
        emailVerified: account.user.emailVerified
          ? new Date(account.user.emailVerified * 1000)
          : null,
      };
    },

    async updateUser({ id, ...data }) {
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified
            ? Math.floor(data.emailVerified.getTime() / 1000)
            : undefined,
        },
      });
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? new Date(user.emailVerified * 1000) : null,
      };
    },

    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: Number(userId) } });
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: Number(account.userId),
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: typeof account.refresh_token === 'string' ? account.refresh_token : null,
          accessToken: typeof account.access_token === 'string' ? account.access_token : null,
          expiresAt: typeof account.expires_at === 'number' ? account.expires_at : null,
          tokenType: typeof account.token_type === 'string' ? account.token_type : null,
          scope: typeof account.scope === 'string' ? account.scope : null,
          idToken: typeof account.id_token === 'string' ? account.id_token : null,
          sessionState: typeof account.session_state === 'string' ? account.session_state : null,
        },
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await prisma.session.create({
        data: {
          sessionToken,
          userId: Number(userId),
          expires: Math.floor(expires.getTime() / 1000),
        },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId.toString(),
        expires: new Date(session.expires * 1000),
      };
    },

    async getSessionAndUser(sessionToken) {
      const sessionAndUser = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!sessionAndUser) return null;
      const { user, ...session } = sessionAndUser;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId.toString(),
          expires: new Date(session.expires * 1000),
        },
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified ? new Date(user.emailVerified * 1000) : null,
        },
      };
    },

    async updateSession({ sessionToken, ...data }) {
      const session = await prisma.session.update({
        where: { sessionToken },
        data: {
          expires: data.expires ? Math.floor(data.expires.getTime() / 1000) : undefined,
        },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId.toString(),
        expires: new Date(session.expires * 1000),
      };
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier,
          token,
          expires: Math.floor(expires.getTime() / 1000),
        },
      });
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires * 1000),
      };
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: new Date(verificationToken.expires * 1000),
        };
      } catch {
        return null;
      }
    },
  };
}
