# 更新日志

本文件记录项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
