# 项目文档目录

本目录包含项目的详细技术文档和参考资料。

## 📚 文档清单

### 架构与设计

#### [ARCHITECTURE-zh.md](./ARCHITECTURE-zh.md)

项目的整体架构设计说明，包括：

- 技术栈选型
- 目录结构设计
- 分层架构（API → Repository → 数据源）
- 数据流向
- 关键设计决策

**适合阅读时机**：

- 新加入项目，需要了解整体架构
- 准备重构或添加大型功能
- 需要理解项目设计理念

---

#### [REPOSITORY-zh.md](./REPOSITORY-zh.md)

Repository 模式的详细说明，包括：

- Repository 模式原理
- 在本项目中的应用
- 如何添加新的 Repository
- 最佳实践和反模式

**适合阅读时机**：

- 需要添加新的数据访问层
- 理解数据库操作如何组织
- 学习如何分离业务逻辑和数据访问

---

### 开发指南

#### [DEVELOPMENT-zh.md](./DEVELOPMENT-zh.md)

完整的开发指南，包括：

- 开发环境配置
- 常用命令详解
- 代码规范和最佳实践
- 调试技巧
- 常见问题解决

**适合阅读时机**：

- 日常开发参考
- 遇到开发环境问题
- 需要了解项目规范

---

#### [MIGRATIONS-zh.md](./MIGRATIONS-zh.md)

数据库迁移系统说明，包括：

- Wrangler 迁移系统原理
- 如何创建迁移文件
- 迁移命名规范
- 多环境迁移管理
- 回滚策略

**适合阅读时机**：

- 需要修改数据库结构
- 遇到迁移相关问题
- 准备发布涉及数据库变更的版本

---

### 部署与运维

#### [DEPLOYMENT-zh.md](./DEPLOYMENT-zh.md)

部署流程和配置说明，包括：

- CI/CD 工作流详解
- 多环境配置（开发/测试/生产）
- 部署前检查清单
- 故障排查指南
- 回滚操作

**适合阅读时机**：

- 配置 CI/CD 流程
- 准备部署到生产环境
- 遇到部署失败问题

---

#### [ENVIRONMENTS-zh.md](./ENVIRONMENTS-zh.md)

环境绑定与密钥表，包括：

- 本地、测试、生产环境的 wrangler 配置差异
- D1、R2、KV 绑定名称
- GitHub Secrets 与部署分支
- 数据填充脚本的使用方式

**适合阅读时机**：

- 新建或验证 Cloudflare 资源
- 排查绑定名称不匹配的问题
- 向团队说明部署准备事项

---

## 📖 文档组织说明

### 根目录 vs docs/ 的区别

**根目录文档**（高频访问、核心必读）：

- `README.md` - 项目首页和概述
- `QUICKSTART.md` - 快速开始指南
- `CHANGELOG.md` - 更新日志

**docs/ 目录**（深入、详细、参考性）：

- 架构设计文档
- 开发详细指南
- 部署操作手册
- 专项功能说明

### 模块内文档

某些模块有自己的 README.md：

- `types/README.md` - 类型定义使用说明
- 其他模块根据需要可添加

---

## 🗺️ 文档阅读路线

### 新成员快速上手

1. [../README-zh.md](../README-zh.md) - 了解项目概况
2. [../QUICKSTART-zh.md](../QUICKSTART-zh.md) - 搭建开发环境
3. [ARCHITECTURE-zh.md](./ARCHITECTURE-zh.md) - 理解整体架构
4. [DEVELOPMENT-zh.md](./DEVELOPMENT-zh.md) - 开始开发

### 添加新功能

1. [ARCHITECTURE-zh.md](./ARCHITECTURE-zh.md) - 确定在哪一层实现
2. [REPOSITORY-zh.md](./REPOSITORY-zh.md) - 如果涉及数据库操作
3. [MIGRATIONS-zh.md](./MIGRATIONS-zh.md) - 如果需要修改数据库
4. [DEVELOPMENT-zh.md](./DEVELOPMENT-zh.md) - 开发规范参考

### 准备发布

1. [DEPLOYMENT-zh.md](./DEPLOYMENT-zh.md) - 部署前检查
2. [../CHANGELOG-zh.md](../CHANGELOG-zh.md) - 查看生成的更新日志

---

## 📝 文档维护

### 何时更新文档

- ✅ 添加新功能 → 更新相关技术文档
- ✅ 修改架构 → 更新 ARCHITECTURE.md
- ✅ 变更部署流程 → 更新 DEPLOYMENT.md
- ✅ 发现文档错误 → 立即修正

### 文档编写规范

1. **使用清晰的标题层级**
   - H1 (`#`) - 文档标题
   - H2 (`##`) - 主要章节
   - H3 (`###`) - 子章节

2. **提供代码示例**

   ```typescript
   // 好的文档包含可运行的示例
   const example = 'like this';
   ```

3. **使用表格和列表**
   - 便于快速扫描
   - 提高可读性

4. **添加链接**
   - 相关文档互相引用
   - 链接到外部资源

---

## 🔍 快速查找

### 我想...

- **了解项目架构** → [ARCHITECTURE-zh.md](./ARCHITECTURE-zh.md)
- **开始开发** → [DEVELOPMENT-zh.md](./DEVELOPMENT-zh.md)
- **修改数据库** → [MIGRATIONS-zh.md](./MIGRATIONS-zh.md)
- **了解 Repository 模式** → [REPOSITORY-zh.md](./REPOSITORY-zh.md)
- **部署到生产** → [DEPLOYMENT-zh.md](./DEPLOYMENT-zh.md)

---

### 故障排查

- 开发环境问题 → [DEVELOPMENT-zh.md#常见问题](./DEVELOPMENT-zh.md#常见问题)
- 部署失败 → [DEPLOYMENT-zh.md#故障排查](./DEPLOYMENT-zh.md#故障排查)
- 数据库迁移错误 → [MIGRATIONS-zh.md](./MIGRATIONS-zh.md)

---

## 🤝 贡献文档

发现文档问题或有改进建议？

1. 提交 Issue 说明问题与场景
2. 或直接提交 PR 修改文档
3. 遵循现有章节结构与风格规范

---

提示：从根目录的 [README-zh.md](../README-zh.md) 开始浏览项目文档。
