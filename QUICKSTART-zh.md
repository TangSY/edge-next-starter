# 快速开始

欢迎使用 Next.js + Cloudflare 全栈模板！按照以下步骤快速启动项目。

## 📦 安装步骤

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd cloudflare-worker-template
```

### 2. 安装 Node.js

使用 nvm 安装项目推荐的 Node.js 版本：

```bash
nvm install
nvm use
```

### 3. 安装 pnpm

```bash
npm install -g pnpm
```

### 4. 安装依赖

```bash
pnpm install
```

### 5. 配置环境变量

```bash
cp .env.local.example .env.local
cp .dev.vars.example .dev.vars
```

### 6. 登录 Cloudflare

```bash
npx wrangler login
```

## ☁️ 创建 Cloudflare 资源

本地开发模式下，Wrangler 会自动模拟 D1、R2 和 KV，因此无需提前创建远程资源。若需要为测试或生产环境准备真实资源，可使用仓库内现有脚本：

### 创建 D1 数据库（远程环境）

```bash
# 测试环境
pnpm run db:create:test

# 生产环境
pnpm run db:create:prod
```

创建完成后，将 Wrangler 输出的 `database_id` 写入相应的 `wrangler.test.toml` 或 `wrangler.prod.toml`。

### 创建 R2 存储桶（远程环境）

> ⚠️ **重要提示**：R2 需要在 Cloudflare Dashboard 中手动启用后才能创建存储桶。
>
> 启用步骤：
>
> 1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
> 2. 选择您的账户
> 3. 左侧菜单选择 `R2`
> 4. 点击 `Enable R2` 或 `Purchase R2`
>
> 启用完成后再执行以下命令：

```bash
# 测试环境
pnpm run r2:create:test

# 生产环境
pnpm run r2:create:prod
```

### 创建 KV 命名空间（远程环境）

```bash
# 测试环境
pnpm run kv:create:test

# 生产环境
pnpm run kv:create:prod
```

运行后，将命令输出的 ID 写入对应的 `wrangler.*.toml` 配置文件中的 `[[kv_namespaces]]`。

## 🗄️ 初始化数据库

### 执行迁移

```bash
pnpm run db:migrate:local
```

### 填充测试数据（可选）

```bash
pnpm run db:seed -- --env=local
```

## 🚀 启动开发服务器

### 选项 A：Next.js 开发模式（快速迭代）

```bash
pnpm dev
```

访问 http://localhost:3000

**注意**：此模式下 Cloudflare 绑定（D1、R2、KV）不可用。

### 选项 B：Cloudflare 完整模式（推荐）

```bash
# 先构建
pnpm build
pnpm run pages:build

# 启动 Cloudflare 开发服务器
pnpm run cf:dev
```

访问 http://localhost:8788

**推荐用于**：测试 Cloudflare 功能、数据库操作、文件上传等。

## ✅ 验证安装

### 测试 API 端点

```bash
# 健康检查
curl http://localhost:3000/api/health

# 用户列表
curl http://localhost:3000/api/users
```

### 运行测试

```bash
pnpm test
```

该命令会执行仓库内的 Vitest 单元测试套件，覆盖数据库、缓存、R2 客户端和仓储层。

## 🔧 常见问题

### 使用 npm 安装报错

本项目强制使用 pnpm，请使用：

```bash
pnpm install
```

### Cloudflare 绑定不可用

确保使用 `pnpm run cf:dev` 而不是 `pnpm dev`。

### 数据库未找到

运行迁移：

```bash
pnpm run db:migrate:local
```

## 📚 下一步

- 查看 [README-zh.md](./README-zh.md) 了解完整功能
- 查看 [DEVELOPMENT-zh.md](./DEVELOPMENT-zh.md) 学习开发流程
- 查看 [DEPLOYMENT-zh.md](./DEPLOYMENT-zh.md) 了解部署方式

## 💡 开发提示

1. 使用 `pnpm dev` 进行快速 UI 开发
2. 使用 `pnpm run cf:dev` 测试 Cloudflare 功能
3. 提交前运行 `pnpm test` 确保测试通过
4. 代码会自动格式化和检查

---

**准备就绪！开始编写业务代码吧！** 🚀
