# 环境配置说明

本文件汇总项目在本地、测试和生产环境中的核心配置，帮助你快速确认绑定名称、部署分支和所需的密钥。

## 环境一览

| 环境     | 配置文件             | 数据库名称                         | R2 绑定  | KV 绑定 | 触发分支              | 主要命令                     |
| -------- | -------------------- | ---------------------------------- | -------- | ------- | --------------------- | ---------------------------- |
| 本地开发 | `wrangler.toml`      | `cloudflare-worker-template-local` | `BUCKET` | `KV`    | 手动                  | `pnpm run cf:dev`            |
| 测试环境 | `wrangler.test.toml` | `cloudflare-worker-template-test`  | `BUCKET` | `KV`    | `develop` / `preview` | `pnpm run pages:deploy:test` |
| 生产环境 | `wrangler.prod.toml` | `cloudflare-worker-template-prod`  | `BUCKET` | `KV`    | `main`                | `pnpm run pages:deploy:prod` |

> 📌 **注意**：Cloudflare Pages 和 Workers 会根据 `wrangler.*.toml` 中的绑定名称注入环境变量。代码中默认读取 `process.env.BUCKET`、`process.env.DB` 和 `process.env.KV`，请确保名称保持一致。

## 必需的 Secrets

在仓库 **Settings → Secrets and variables → Actions** 中定义以下密钥，以便 CI/CD 工作流可以创建数据库、执行迁移并部署页面：

| 名称                                        | 用途                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`                      | 授权 Wrangler 创建/迁移 D1、R2、KV 并部署 Pages                        |
| `CLOUDFLARE_ACCOUNT_ID`                     | 标识 Cloudflare 账户，供 Wrangler 调用                                 |
| `NEXTAUTH_SECRET`                           | NextAuth JWT 会话所需，使用 `wrangler secret put NEXTAUTH_SECRET` 设置 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | NextAuth 的 Google OAuth 凭据，两项必须成对配置                        |

如有额外的第三方服务密钥，请在此处新增并在 `wrangler.*.toml` 的 `[vars]` 中引用。对于 Google OAuth，请分别在 Cloudflare Pages 的 Preview 与 Production 环境中配置对应的 Client ID/Secret，确保回调域名匹配。

### NEXTAUTH_SECRET 配置详解

`NEXTAUTH_SECRET` 是 NextAuth.js 用于加密和签名 JWT tokens 的关键安全密钥。正确配置对于认证安全至关重要。

#### 生成安全密钥

使用以下任一方法生成加密安全的随机密钥：

```bash
# 方法1：使用 OpenSSL（推荐）
openssl rand -base64 32

# 方法2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3：在线生成器
# 访问 https://generate-secret.vercel.app/32
```

#### 不同环境的配置方式

**本地开发环境：**

- 在 `.env.local` 中使用默认值 `dev-secret` 即可
- 本地开发环境的安全验证相对宽松
- **绝对不要在生产环境中使用此默认值**

**CI/CD 构建：**

- CI 构建会自动跳过 NEXTAUTH_SECRET 验证
- 构建过程使用 `CI=true` 标志以允许编译期使用默认值
- 运行时验证仍会强制执行生产环境要求

**测试/生产部署（Cloudflare Pages）：**

1. 使用上述方法生成唯一的密钥
2. 在 Cloudflare Pages 控制台中配置：
   - 进入你的 Pages 项目
   - 点击 `Settings`（设置）→ `Environment variables`（环境变量）
   - 添加变量：
     - **Name**（名称）：`NEXTAUTH_SECRET`
     - **Value**（值）：（粘贴你生成的密钥）
     - **Environment**（环境）：根据需要选择 `Production`（生产）和/或 `Preview`（预览）

**安全最佳实践：**

- ✅ 为每个环境（测试、生产）生成独立的密钥
- ✅ 将密钥存储在环境变量中，绝不写入代码
- ✅ 使用至少 32 字节（256 位）的随机性
- ✅ 定期轮换密钥以增强安全性
- ❌ 绝不将实际密钥提交到版本控制系统
- ❌ 绝不在不同项目之间共享密钥
- ❌ 绝不在生产环境中使用默认的 `dev-secret` 值

**验证行为说明：**

应用程序会根据运行时环境验证 `NEXTAUTH_SECRET`：

- **开发环境**（`NODE_ENV=development`）：接受默认值
- **CI 构建**（`CI=true`）：构建阶段跳过验证
- **生产运行时**（`NODE_ENV=production`，非 CI）：要求非默认的安全值，如果检测到默认值会抛出错误

**故障排除：**

如果遇到错误 "NEXTAUTH_SECRET must be configured for production environments"：

1. 确保已在 Cloudflare Pages 环境变量中设置 `NEXTAUTH_SECRET`
2. 验证环境变量已为正确的环境设置（生产/预览）
3. 检查是否使用了默认的 `dev-secret` 值
4. 更新环境变量后重新部署应用程序

## 绑定校验清单

- D1：确认 `database_name` 与上表一致，远程环境需要真实的 `database_id`。
- R2：绑定名统一为 `BUCKET`，否则 `createR2Client()` 将返回 `null`。
- KV：绑定名统一为 `KV`，与缓存客户端保持一致。
- 变量：可在 `[vars]` 中设置 `ENVIRONMENT`、`RATE_LIMIT_*`、`LOG_LEVEL` 等可选参数。

## Analytics 后端切换（降级方案）

通过环境变量选择 Analytics 事件写入后端：

- `ANALYTICS_ENABLED`: `true|false`，默认 `true`
- `ANALYTICS_SINK`: `log|kv|d1|engine`，默认 `log`

建议：

- 开发/测试：`ANALYTICS_SINK=log`（或 `kv` 做轻量计数）
- 生产：优先 `engine`（接入 Analytics Engine），失败时自动退回日志；如需结构化留存可先用 `d1`（需配套迁移表）

注意：

- `kv` 模式当前只做按事件类型+日期的计数累加，便于观测热点；如需明细请改为 `d1` 并建表
- `engine` 模式需配置 Analytics Engine 的 binding，未配置将退回到日志

## Analytics Engine 绑定示例（生产环境）

在 `wrangler.prod.toml` 中添加 Analytics Engine 数据集绑定，并在环境变量中选择 `engine` 作为后端：

```toml
[vars]
ENVIRONMENT = "production"
ANALYTICS_SINK = "engine"

[[analytics_engine_datasets]]
binding = "ANALYTICS"                 # 代码中通过 env.ANALYTICS 获取
dataset = "your-analytics-dataset"    # 请替换为真实数据集名称
```

代码侧通过 `getAnalyticsEngine()` 获取绑定：

```ts
import { getAnalyticsEngine } from '@/lib/analytics';

const engine = getAnalyticsEngine();
await engine?.writeDataPoint({
  blobs: [
    /* 字符串列 */
  ],
  doubles: [
    /* 数值列 */
  ],
  indexes: [
    /* 索引列 */
  ],
});
```

注意：未配置 binding 或写入失败时，系统会自动回退到日志后端，保障业务不中断。

## 数据初始化

使用脚本 `scripts/seed.js` 向数据库注入示例数据：

```bash
# 本地（Wrangler 会使用本地 SQLite 文件）
pnpm run db:seed -- --env=local

# 测试环境（需要远程数据库和 Cloudflare 凭证）
pnpm run db:seed -- --env=test

# 生产环境（谨慎执行）
pnpm run db:seed -- --env=prod
```

脚本会自动匹配对应的数据库名称和命令参数；如果传入未支持的环境，会直接退出并提示。

## 部署前检查

1. `pnpm test && pnpm run type-check && pnpm run format:check`
2. `pnpm run db:migrate:local` 或远程迁移命令是否执行成功
3. 所有 Cloudflare 绑定是否已经在 Dashboard 中创建
4. Secrets 是否配置完成
5. `release-please` 生成的版本和 CHANGELOG 是否符合预期

保持以上清单为最新，有助于外部贡献者和运维团队快速上手与排查问题。
