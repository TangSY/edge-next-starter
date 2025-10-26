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

| 名称                    | 用途                                            |
| ----------------------- | ----------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | 授权 Wrangler 创建/迁移 D1、R2、KV 并部署 Pages |
| `CLOUDFLARE_ACCOUNT_ID` | 标识 Cloudflare 账户，供 Wrangler 调用          |

如有额外的第三方服务密钥，请在此处新增并在 `wrangler.*.toml` 的 `[vars]` 中引用。

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
