# Environment Configuration

This document summarizes core configuration across local, test, and production environments, including binding names, deploy branches, and required secrets.

## Environments Overview

| Environment | Config file          | Database name                      | R2 binding | KV binding | Branch                | Key command                  |
| ----------- | -------------------- | ---------------------------------- | ---------- | ---------- | --------------------- | ---------------------------- |
| Local dev   | `wrangler.toml`      | `cloudflare-worker-template-local` | `BUCKET`   | `KV`       | manual                | `pnpm run cf:dev`            |
| Test        | `wrangler.test.toml` | `cloudflare-worker-template-test`  | `BUCKET`   | `KV`       | `develop` / `preview` | `pnpm run pages:deploy:test` |
| Production  | `wrangler.prod.toml` | `cloudflare-worker-template-prod`  | `BUCKET`   | `KV`       | `main`                | `pnpm run pages:deploy:prod` |

> 📌 Note: Cloudflare Pages and Workers inject env vars based on bindings in `wrangler.*.toml`. Code reads `process.env.BUCKET`, `process.env.DB`, and `process.env.KV`. Keep names consistent.

## Required Secrets

在仓库 **Settings → Secrets and variables → Actions** 中定义以下密钥，以便 CI/CD 工作流可以创建数据库、执行迁移并部署页面：

| Name                    | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Authorize Wrangler to create/migrate D1, R2, KV and deploy Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Identify the Cloudflare account for Wrangler API calls           |

Add extra third‑party secrets here and reference them in `[vars]` of `wrangler.*.toml`.

## Bindings Checklist

- D1: Confirm `database_name` matches the table; remote environments require real `database_id`.
- R2: Binding must be `BUCKET`, otherwise `createR2Client()` returns `null`.
- KV: Binding must be `KV`, consistent with cache client.
- Vars: Set optional `ENVIRONMENT`, `RATE_LIMIT_*`, `LOG_LEVEL` in `[vars]`.

## Analytics Backend Selection (fallbacks)

通过环境变量选择 Analytics 事件写入后端：

- `ANALYTICS_ENABLED`: `true|false` (default `true`)
- `ANALYTICS_SINK`: `log|kv|d1|engine` (default `log`)

Recommendations:

- Dev/Test: `ANALYTICS_SINK=log` (or `kv` for lightweight counts)
- Production: prefer `engine`; on failure fallback to logs. For structured retention, `d1` with migration tables.

Notes:

- `kv` mode only accumulates counts per event type + date
- `engine` mode requires a binding; without it, falls back to logs

## Analytics Engine Binding Example (production)

在 `wrangler.prod.toml` 中添加 Analytics Engine 数据集绑定，并在环境变量中选择 `engine` 作为后端：

```toml
[vars]
ENVIRONMENT = "production"
ANALYTICS_SINK = "engine"

[[analytics_engine_datasets]]
binding = "ANALYTICS"                 # 代码中通过 env.ANALYTICS 获取
dataset = "your-analytics-dataset"    # 请替换为真实数据集名称
```

Code retrieves binding via `getAnalyticsEngine()`:

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

Note: Without binding or on write failure, system falls back to logs.

## Data Initialization

使用脚本 `scripts/seed.js` 向数据库注入示例数据：

```bash
# 本地（Wrangler 会使用本地 SQLite 文件）
pnpm run db:seed -- --env=local

# 测试环境（需要远程数据库和 Cloudflare 凭证）
pnpm run db:seed -- --env=test

# 生产环境（谨慎执行）
pnpm run db:seed -- --env=prod
```

The script auto‑matches DB name and args; unsupported env exits with a message.

## Pre‑Deployment Checks

1. `pnpm test && pnpm run type-check && pnpm run format:check`
2. `pnpm run db:migrate:local` 或远程迁移命令是否执行成功
3. 所有 Cloudflare 绑定是否已经在 Dashboard 中创建
4. Secrets 是否配置完成
5. `release-please` 生成的版本和 CHANGELOG 是否符合预期

Keep this checklist current to help contributors and ops onboard and troubleshoot.
