# 更新日志

本文件记录项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)،项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.1.0](https://github.com/TangSY/edge-next-starter/compare/cloudflare-worker-template-v1.0.0...cloudflare-worker-template-v1.1.0) (2025-11-02)

### ✨ 新增功能

- 新增 OAuth 登录功能 ([2be786e](https://github.com/TangSY/edge-next-starter/commit/2be786e41afb79ebdf45a2d6ac1149e0638e95e1))
- 在首页页脚添加隐私政策和服务条款链接 ([715d6c5](https://github.com/TangSY/edge-next-starter/commit/715d6c5e9a6e6104477fe7158ecc7f9f6befdaa3))
- 添加隐私条款示例 ([694e449](https://github.com/TangSY/edge-next-starter/commit/694e4498a553bc34c46d62fdafa3c77f5650e8a9))
- 使用 NextAuth v5 实现身份认证系统 ([063dbeb](https://github.com/TangSY/edge-next-starter/commit/063dbebe1a658b97bda7cfc3a5ccbb40d270313e))
- 初始化项目 ([80cf32c](https://github.com/TangSY/edge-next-starter/commit/80cf32c0f59033428c6f82283ed08c4f0d8355ac))
- **上传功能:** 添加图片/音频/视频预览支持 ([f802b4b](https://github.com/TangSY/edge-next-starter/commit/f802b4b465de4976a7273e0515cc65b10881dbf2))
- **上传功能:** 支持多文件上传 ([6056cd7](https://github.com/TangSY/edge-next-starter/commit/6056cd70950121d38e10bdc82b0d09516e8bdb38))

### 🐛 问题修复

- 在 getCloudflareEnv 中添加缺失的控制台警告 ([39b7fb8](https://github.com/TangSY/edge-next-starter/commit/39b7fb8962e0ce8d0ae3492f61eb665650907a9b))
- 修复 AnalyticsEngineDataset 绑定问题 ([caaa6f7](https://github.com/TangSY/edge-next-starter/commit/caaa6f70d3ea0c8fbc81929b2fb9d521645e5bea))
- 修正本地开发环境下登录/注册页面的重定向逻辑 ([95d7ddd](https://github.com/TangSY/edge-next-starter/commit/95d7dddf68116443f9eaf868c8c02b365f07570c))
- 实现 Edge 兼容的密码哈希并解决 Cloudflare Pages 部署问题 ([db1dd1c](https://github.com/TangSY/edge-next-starter/commit/db1dd1cda40b27a23345081821968f9e48d50a81))
- 实现 Edge 兼容的密码哈希并解决 Cloudflare Pages 部署问题 ([f1b1f3c](https://github.com/TangSY/edge-next-starter/commit/f1b1f3c83ef1d979ccde6750d8d13d523788c89f))
- 实现 Edge 兼容的密码哈希并解决 Cloudflare Pages 部署问题 ([8d8c992](https://github.com/TangSY/edge-next-starter/commit/8d8c99226699edf894078cff07c40e152575db76))
- 为 Cloudflare Pages 实现 Edge 兼容的密码哈希 ([76fb29f](https://github.com/TangSY/edge-next-starter/commit/76fb29fca2cfe68836f867d28986bfd7f8ee0f82))
- 解决 ESLint 错误并更新包依赖 ([75a867c](https://github.com/TangSY/edge-next-starter/commit/75a867c6825086d1cd08b6f70d1be8aafdd81363))
- 解决 NEXTAUTH_SECRET 持续集成构建问题 ([397a1d0](https://github.com/TangSY/edge-next-starter/commit/397a1d00d0717d71d6023df958e0b8c7b6328bef))
- 更新动态路由处理器以支持 Next.js 15 异步参数 ([12b50a0](https://github.com/TangSY/edge-next-starter/commit/12b50a02d8f152aaff86ce91324e0955758fe10e))
- validate-migrations 脚本现在支持 Prisma @map 指令 ([4040be1](https://github.com/TangSY/edge-next-starter/commit/4040be16a4c1064ca80ceced1aeb0af8c79fb603))

### ♻️ 代码重构

- **认证:** 将中间件改为默认保护策略 ([35e2c59](https://github.com/TangSY/edge-next-starter/commit/35e2c5937bb75fdb7cc4719fb364c466abf86a9a))
- 重组项目结构并修复登出功能 ([9b49834](https://github.com/TangSY/edge-next-starter/commit/9b49834dc06751e45b2c60b3262fac5c3686101a))
- 用 axios 替换 fetch 并统一 API 客户端 ([31b29a8](https://github.com/TangSY/edge-next-starter/commit/31b29a8ce01c10093c25a0358b96b2a369e833c1))

### 📝 文档更新

- 为 README 文件添加语言切换器 ([f9162ec](https://github.com/TangSY/edge-next-starter/commit/f9162ec5d828b2da60295e21fbf75a62f37452f7))
- 添加技术栈徽章 [release] ([fa17c78](https://github.com/TangSY/edge-next-starter/commit/fa17c78354827cc88a88d449d1af8953106476ad))
- 项目国际化 ([63012de](https://github.com/TangSY/edge-next-starter/commit/63012de43d2d1e381ecca07e8abe4bb17b3bcc37))
- 同步文档与实现 ([1cf9a80](https://github.com/TangSY/edge-next-starter/commit/1cf9a80b31e9d11b5173475350ba02281d6b24b9))

### ✅ 测试

- 模拟 cloudflare/next-on-pages ([502db21](https://github.com/TangSY/edge-next-starter/commit/502db21b5402888034cd6ba6c7211092f1d4090f))

### 👷 持续集成/部署

- 文档变更时跳过 CI ([1480e0f](https://github.com/TangSY/edge-next-starter/commit/1480e0f5948cf0079cf9c37a47c10435c5c99f97))

## [1.0.0] — 2025-10-16

### 新增功能

- 基于 Next.js 15+ 的初始项目架构
- 支持 Cloudflare Pages 部署（Edge Runtime）
- D1 数据库集成及迁移系统
- R2 对象存储集成（文件上传）
- KV 缓存集成（性能优化）
- Tailwind CSS 配置
- TypeScript 严格模式
- ESLint 和 Prettier 代码规范
- GitHub Actions 持续集成/部署工作流
  - 持续集成（代码检查、类型检查、构建）
  - 测试环境自动部署
  - 生产环境自动部署
- 数据库迁移脚本
- 数据库种子数据脚本
- 完整的项目文档
  - README.md（项目概览）
  - DEVELOPMENT.md（开发指南）
  - DEPLOYMENT.md（部署指南）
  - QUICKSTART.md（快速开始）
- 示例 API 路由
  - 健康检查端点
  - 用户 CRUD API
  - 文件上传/下载 API
- 多环境配置
  - 开发环境（wrangler.toml）
  - 测试环境（wrangler.test.toml）
  - 生产环境（wrangler.prod.toml）
- 工具库封装
  - 数据库客户端封装
  - R2 存储客户端封装
  - KV 缓存客户端封装
- Cloudflare TypeScript 类型定义
- 常用任务的 NPM 脚本
- 完整的测试框架（Vitest）
  - 22+ 个单元测试用例
  - D1、R2、KV 客户端测试覆盖
  - 测试优先的 CI/CD 流程
- pnpm 包管理器强制使用
  - .npmrc 配置（中国镜像）
  - preinstall 检查脚本
  - .nvmrc Node 版本管理

### 基础设施

- D1 数据库表结构
  - 用户表（users）
  - 文章表（posts）
  - 迁移记录表（migrations）
- R2 存储桶配置
- KV 命名空间配置

### 开发体验

- 开发环境热模块替换
- 类型安全的 API 开发
- 自动代码格式化
- 预配置的代码规范
- Git 工作流文档
- 测试监听模式
