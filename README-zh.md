[English](./README.md) | 简体中文

---

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat&logo=typescript)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat&logo=tailwind-css)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat&logo=cloudflare)
![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?style=flat&logo=prisma)
![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?style=flat&logo=node.js)
![pnpm](https://img.shields.io/badge/pnpm-8.15.0-F69220?style=flat&logo=pnpm)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

</div>

---

# Next.js + Cloudflare 全栈模板

一个开箱即用的 Next.js + Cloudflare 全栈项目模板，集成 Edge Runtime、D1 数据库、R2 存储、Analytics Engine 事件分析和完整的 CI/CD 流程。

## ✨ 特性

### 核心技术栈

- **Next.js 15.5.2** - 使用 App Router 和 TypeScript
- **Cloudflare Pages** - Edge Runtime 部署
- **D1 Database** - 边缘端 SQLite 数据库
- **R2 Storage** - 零出站费用的对象存储
- **KV Storage** - 高性能键值缓存
- **Analytics Engine** - 事件分析和监控
- **Tailwind CSS** - 实用优先的 CSS 框架

### 开发工具

- **pnpm** - 快速、节省磁盘空间的包管理器
- **Vitest** - 现代化的单元测试框架
- **ESLint + Prettier** - 代码规范和格式化
- **TypeScript** - 类型安全

### 自动化流程

- ✅ Vitest 覆盖核心仓储、数据库、缓存和存储客户端
- ✅ 自动化 CI/CD 部署（带构建缓存优化）
- ✅ 数据库迁移自动执行和验证
- ✅ 多环境配置（开发/测试/生产）
- ✅ API 速率限制（基于 KV 的滑动窗口算法）
- ✅ 自动生成 CHANGELOG（基于 Conventional Commits）
- ✅ **环境变量自动校验（Zod）**
- ✅ **结构化日志和请求追踪（内置 Analytics 钩子，可扩展到 Analytics Engine）**
- ✅ **数据库迁移自动校验脚本**

## 📋 前置要求

- **Node.js** >= 20.0.0 (推荐使用 nvm 管理版本)
- **pnpm** >= 8.0.0
- **Cloudflare 账户**
- **Git**

## 🚀 快速开始

完整安装配置步骤请查看 **[快速开始指南](./QUICKSTART-zh.md)**。该文档覆盖依赖安装、Cloudflare 登录、资源创建、迁移执行与开发服务器启动的全流程，这里只保留入口说明。

## 📁 项目结构

```
cloudflare-worker-template/
├── app/                        # Next.js App Router
│   ├── api/                   # API 路由（Edge Runtime）
│   │   ├── health/           # 健康检查
│   │   ├── users/            # 用户 CRUD 示例
│   │   ├── posts/            # 文章 CRUD 示例
│   │   └── upload/           # 文件上传示例
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页
│   └── globals.css           # 全局样式
├── repositories/              # 数据访问层（Repository 模式）
│   ├── index.ts              # Repository 工厂
│   ├── user.repository.ts    # User 数据操作
│   └── post.repository.ts    # Post 数据操作
├── lib/                       # 工具库
│   ├── api/                  # API 工具（响应格式、中间件、数据库包装器）
│   ├── db/                   # D1 数据库客户端（Prisma 单例）
│   ├── r2/                   # R2 存储客户端
│   ├── cache/                # KV 缓存客户端
│   ├── errors/               # 统一错误处理
│   ├── logger/               # 日志系统
│   └── utils/                # 通用工具
├── components/                # React 组件
├── types/                     # TypeScript 类型定义
├── migrations/                # 数据库迁移文件（SQL）
│   ├── 0001_init.sql         # 初始化表结构
│   └── 002_example.sql.template
├── prisma/                    # Prisma 配置
│   └── schema.prisma         # 数据库模型定义
├── scripts/                   # 自动化脚本
│   └── seed.js               # 数据填充
├── __tests__/                 # 测试文件
│   ├── lib/                  # 单元测试
│   └── api/                  # API 测试
├── .github/workflows/         # GitHub Actions CI/CD
│   ├── ci.yml                # 持续集成
│   ├── deploy-test.yml       # 测试环境部署
│   └── deploy-prod.yml       # 生产环境部署
├── wrangler.toml              # 本地环境配置
├── wrangler.test.toml         # 测试环境配置
├── wrangler.prod.toml         # 生产环境配置
├── .nvmrc                     # Node.js 版本
├── .npmrc                     # pnpm 配置
├── vitest.config.ts           # 测试配置
└── package.json               # 项目配置
```

## 🛠️ 常用命令

详细命令说明请查看 **[开发指南](./docs/DEVELOPMENT-zh.md)**

```bash
# 开发
pnpm dev                    # Next.js 开发服务器
pnpm run cf:dev             # Cloudflare 完整功能开发

# 测试
pnpm test                   # 运行所有测试
pnpm run test:watch         # 监听模式

# 构建和部署
pnpm build                  # 构建应用
pnpm run pages:deploy       # 部署到 Cloudflare
```

## 🔄 持续集成/部署

详细部署配置和流程请查看 **[部署指南](./docs/DEPLOYMENT-zh.md)**

- **持续集成**：每次 push 自动运行测试、类型检查和构建
- **自动部署**：
  - `develop` 分支 → 测试环境
  - `main` 分支 → 生产环境

### 配置密钥

在仓库设置中添加：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 📦 API 示例

### 健康检查

```bash
curl https://your-domain.com/api/health
```

### 用户管理（带缓存）

```bash
# 获取所有用户
curl https://your-domain.com/api/users

# 创建用户
curl -X POST https://your-domain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "张三"}'
```

### 文件上传到 R2

```bash
# 通过 API 上传文件
curl -X POST https://your-domain.com/api/upload \
  -F "file=@image.jpg"

# 下载文件
curl https://your-domain.com/api/upload?key=uploads/1234567890-image.jpg

### 上传页面（R2 演示）

- 访问 `/upload` 试用浏览器端上传 UI（调用 `/api/upload` 并展示预览）。
```

## 🧪 测试

```bash
pnpm test                   # 运行核心单元测试
pnpm run test:coverage      # 查看覆盖率
```

测试覆盖：D1 数据库、R2 存储、KV 缓存、错误处理

## 🌍 多环境配置

- **开发环境**：`wrangler.toml` - 本地开发
- **测试环境**：`wrangler.test.toml` - `develop` 分支自动部署
- **生产环境**：`wrangler.prod.toml` - `main` 分支自动部署

详细的绑定名称、Secrets 以及数据填充命令请参阅 [docs/ENVIRONMENTS-zh.md](./docs/ENVIRONMENTS-zh.md)。

## 📈 Cloudflare 免费额度（Workers Free）

以下为在 Cloudflare Workers Free 计划下的主要免费额度概览（以官方当前文档为准，可能随时调整）：

- Pages（部署与托管）
  - 项目（站点）：100 个
  - 每月构建次数：500 次
  - 并发构建：1 个
  - 自定义域名：每个项目 100 个
  - 带宽/静态请求：无限制

- Pages Functions（后端逻辑，与 Workers 共享额度）
  - 每日请求：100,000 次
  - CPU 时间：每次请求 10 毫秒

- D1 Database（数据库）
  - 数据库数量：10 个
  - 总存储空间：5 GB（所有数据库共享）
  - 每日行读取：5,000,000 次
  - 每日行写入：100,000 次

- R2 Storage（对象存储）
  - 存储空间：每月 10 GB
  - Class A 操作（写入/删除等）：每月 1,000,000 次
  - Class B 操作（读取）：每月 10,000,000 次
  - 出站流量（Egress）：永久免费（$0）

- KV Storage（键值缓存）
  - 总存储空间：1 GB
  - 每日读取操作：10,000,000 次
  - 每日写入/删除/列出操作：100,000 次（合计）

- Analytics Engine（分析引擎）
  - 每日数据写入（Data points written）：100,000 个
  - 每日数据读取（Read queries）：10,000 次

提示：若需更高配额或更强功能，可升级 Workers 付费计划；同时建议在生产环境通过特性开关接入 Analytics Engine，在开发/测试环境保持日志或 KV/D1 作为降级方案。

## 💡 开发最佳实践

详细的开发规范请查看 **[开发指南](./docs/DEVELOPMENT-zh.md)**

1. **强制使用 pnpm** - 项目已配置自动检查
2. **遵循代码规范** - 提交前自动执行 ESLint 和 Prettier
3. **编写测试** - 为新功能添加测试用例
4. **使用数据库迁移** - 通过迁移文件管理数据库变更

## 🔧 常见问题

常见的开发与部署疑难项已经录入专题文档：

- 开发排障请参见 [开发指南的常见问题章节](./docs/DEVELOPMENT-zh.md#常见问题)
- 部署排障请参见 [部署指南的故障排查章节](./docs/DEPLOYMENT-zh.md#故障排查)

## 📚 相关文档

### 核心文档

- [QUICKSTART-zh.md](./QUICKSTART-zh.md) - 快速开始指南
- [CHANGELOG-zh.md](./CHANGELOG-zh.md) - 更新日志

### 技术文档

- [ARCHITECTURE-zh.md](./docs/ARCHITECTURE-zh.md) - 项目架构说明
- [DEVELOPMENT-zh.md](./docs/DEVELOPMENT-zh.md) - 开发指南
- [DEPLOYMENT-zh.md](./docs/DEPLOYMENT-zh.md) - 部署指南
- [ENVIRONMENTS-zh.md](./docs/ENVIRONMENTS-zh.md) - 环境绑定与密钥清单

### 专项文档

- [REPOSITORY-zh.md](./docs/REPOSITORY-zh.md) - Repository 模式指南
- [MIGRATIONS-zh.md](./docs/MIGRATIONS-zh.md) - 数据库迁移指南

## 🔗 技术文档

- [Next.js](https://nextjs.org/docs) | [Cloudflare Pages](https://pages.cloudflare.com/)
- [D1 Database](https://developers.cloudflare.com/d1/) | [R2 Storage](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## 🎯 快速开始业务开发

拿到这个模板后：

1. ✅ 按照 [快速开始指南](./QUICKSTART-zh.md) 完成初始化
2. ✅ 在 `app/` 目录下编写页面和 API
3. ✅ 提交代码，CI/CD 自动测试和部署
4. ✅ 专注业务逻辑，无需关心基础设施

---
