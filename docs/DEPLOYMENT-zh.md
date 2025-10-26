# 部署指南

本指南介绍如何将应用部署到 Cloudflare Pages 的测试和生产环境。

## 📋 前置准备

### 1. Cloudflare 账户和 API Token

1. 注册 [Cloudflare 账户](https://cloudflare.com)
2. 获取 Account ID（仪表板右侧）
3. 访问 [API Tokens](https://dash.cloudflare.com/profile/api-tokens) 创建 Token
4. 选择 "Edit Cloudflare Workers" 模板

### 2. 配置密钥

Actions 所需的 Secrets、环境变量命名与绑定说明统一维护在 [环境配置说明](./ENVIRONMENTS-zh.md)，部署前请逐项核对。

## ☁️ 创建 Cloudflare 资源

### 🚨 重要：首次部署前必须创建 Pages 项目

在使用 CI/CD 自动部署或手动部署前，**必须先在 Cloudflare 上创建 Pages 项目**，否则部署会失败并报错 `Project not found`。

#### 方法一：通过 Cloudflare Dashboard 创建（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的账户
3. 左侧菜单选择 **Workers & Pages**
4. 点击 **Create application** → 选择 **Pages** 标签
5. 点击 **Create using direct upload**（或连接 Git 仓库）
6. 输入项目名称：
   - 测试环境：`cloudflare-worker-template-test`
   - 生产环境：`cloudflare-worker-template-prod`
7. 点击 **Create project**
8. **不需要**立即上传文件，项目创建后可以直接跳过

#### 方法二：通过 Wrangler CLI 创建

```bash
# 测试环境
pnpm run build
npx wrangler pages project create cloudflare-worker-template-test --production-branch=develop

# 生产环境
npx wrangler pages project create cloudflare-worker-template-prod --production-branch=main
```

#### 验证项目创建成功

```bash
# 列出所有 Pages 项目
npx wrangler pages project list

# 应该能看到创建的项目名称
```

### 其他 Cloudflare 资源

其他资源（D1 数据库、R2 存储桶、KV 命名空间）的创建命令、参数示例与 `wrangler.*.toml` 配置映射已集中在 [快速开始指南](../QUICKSTART-zh.md)。如需回顾脚本或环境差异，请以该文档为准。

## 🗄️ 数据库迁移

```bash
# 测试环境
pnpm run db:migrate:test

# 生产环境
pnpm run db:migrate:prod
```

## 🚀 部署方式

### 自动部署（推荐）

**测试环境**：推送到 `develop` 分支自动部署

```bash
git checkout develop
git add .
git commit -m "feat: your feature"
git push origin develop
```

**生产环境**：推送到 `main` 分支自动部署

```bash
git checkout main
git merge develop
git push origin main
```

### 手动部署

```bash
pnpm run pages:deploy        # 开发环境
pnpm run pages:deploy:test   # 测试环境
pnpm run pages:deploy:prod   # 生产环境
```

## 🔄 持续集成/部署

### 持续集成（所有分支）

每次 push 触发：测试 → ESLint → 类型检查 → 格式检查 → 构建

### 自动部署

- **测试环境**：`develop` 或 `preview` 分支 → 测试 → 迁移 → 部署
- **生产环境**：`main` 分支 → 测试 → 迁移 → 部署 → 报告

## 🌐 自定义域名

1. Cloudflare Dashboard → Pages → 项目 → Custom domains
2. Add domain 并按提示配置 DNS
3. SSL/TLS 证书自动提供

## 📊 环境变量

在 Cloudflare Dashboard → Pages → 项目 → Settings → Environment variables 中为不同环境（Production/Preview）添加变量。

## 🔍 监控和日志

```bash
# 列出部署记录
wrangler pages deployment list

# 实时日志
wrangler pages deployment tail

# Worker 日志
wrangler tail
```

查看 Analytics：Cloudflare Dashboard → Pages → 项目 → Analytics

## 🔙 回滚部署

**Dashboard 方式**：Pages → 项目 → Deployments → 选择之前的部署 → Rollback

**命令行方式**：

```bash
wrangler pages deployment list
wrangler pages deployment rollback <DEPLOYMENT_ID>
```

## 🐛 故障排查

### Pages 项目不存在错误

**错误信息**：`Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`

**原因**：未在 Cloudflare 上创建对应的 Pages 项目

**解决方案**：

1. 按照上方 "创建 Cloudflare 资源" 部分的步骤创建 Pages 项目
2. 确保项目名称与 `wrangler.*.toml` 中的 `name` 字段一致
3. 验证项目创建成功：`npx wrangler pages project list`

### Analytics Engine Dataset 错误

**错误信息**：`Invalid dataset name: prod_analytics_dataset [code: 8000022]`

**原因**：配置文件中启用了 Analytics Engine，但对应的 dataset 还未创建

**解决方案（选择其一）**：

**方案一：使用 KV 替代（推荐，快速解决）**

编辑 `wrangler.prod.toml`：

```toml
[vars]
ANALYTICS_SINK = "kv"  # 使用 KV 存储分析数据

# 注释掉 Analytics Engine binding
# [[analytics_engine_datasets]]
# binding = "ANALYTICS"
# dataset = "prod_analytics_dataset"
```

**方案二：创建 Analytics Engine Dataset**

```bash
# 创建 dataset
npx wrangler analytics-engine create prod_analytics_dataset

# 验证
npx wrangler analytics-engine list
```

然后在 `wrangler.prod.toml` 中保持 `ANALYTICS_SINK = "engine"` 配置。

### 构建失败

检查 CI 日志并运行本地检查：

```bash
pnpm test && pnpm run type-check && pnpm lint
```

### 数据库连接失败

确认：

1. `wrangler.toml` 中 database_id 正确
2. 数据库已创建并执行迁移

### R2 存储问题

**错误：`Please enable R2 through the Cloudflare Dashboard`**

R2 服务需要在 Cloudflare Dashboard 中手动启用：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 选择账户 → R2
2. 点击 `Enable R2` 或 `Purchase R2`（有 10GB 免费额度）
3. 启用后执行：`pnpm run r2:create:test` / `pnpm run r2:create:prod`

**其他问题**

确认 Bucket 名称、创建状态和绑定配置是否正确

### 部署后 404

确认 `pages_build_output_dir` 设置为 `.vercel/output/static`

## ⚡ 性能优化

**Edge 缓存**：设置 `Cache-Control` 头
**KV 缓存**：使用 `withCache()` 包装器
**数据库优化**：添加索引、分页、批量操作

详细优化方法请查看 [开发指南](./DEVELOPMENT-zh.md)

## 💰 成本管理

### 免费额度

- D1：5GB 存储 + 500 万次读/天
- R2：10GB 存储（无出站费用）
- Pages：无限请求 + 500 次构建/月
- KV：100K 次读 + 1K 次写/天

在 Cloudflare Dashboard 监控用量

## 📝 部署检查清单

- [ ] Cloudflare Pages 项目已创建（测试/生产环境）
- [ ] D1 数据库已创建并配置到 wrangler.toml
- [ ] R2 存储桶已创建（需先启用 R2 服务）
- [ ] KV 命名空间已创建并配置到 wrangler.toml
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] 环境变量已配置
- [ ] 数据库已迁移
- [ ] GitHub 密钥已设置（CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID）

## 🆘 常见问题

**如何切换环境？**
通过不同分支触发：`develop` → 测试环境，`main` → 生产环境

**如何手动触发部署？**
GitHub Actions 页面 → 选择 workflow → Run workflow

**部署失败如何调试？**
查看 GitHub Actions 日志，本地运行相同的构建命令

**如何更新数据库 schema？**
创建新迁移文件并提交，CI/CD 会自动执行

## 📚 相关文档

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**部署成功！** 🎉
