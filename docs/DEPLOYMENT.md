# Deployment Guide

This guide describes how to deploy to Cloudflare Pages test and production environments.

## 📋 Prerequisites

### 1. Cloudflare Account and API Token

1. Sign up for a [Cloudflare account](https://cloudflare.com)
2. Get the Account ID (right side of dashboard)
3. Visit [API Tokens](https://dash.cloudflare.com/profile/api-tokens) to create a token
4. Choose the "Edit Cloudflare Workers" template

### 2. Configure secrets

Secrets, env vars naming, and bindings are maintained in [Environment Config](./ENVIRONMENTS.md). Verify before deploying.

## ☁️ Create Cloudflare resources

### 🚨 Important: Create Pages Project Before First Deployment

Before using CI/CD automatic deployment or manual deployment, **you must first create a Pages project on Cloudflare**, otherwise deployment will fail with error `Project not found`.

#### Method 1: Create via Cloudflare Dashboard (Recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Navigate to **Workers & Pages** from the left menu
4. Click **Create application** → Select **Pages** tab
5. Click **Create using direct upload** (or connect Git repository)
6. Enter project name:
   - Test environment: `cloudflare-worker-template-test`
   - Production environment: `cloudflare-worker-template-prod`
7. Click **Create project**
8. **No need** to upload files immediately, you can skip after project creation

#### Method 2: Create via Wrangler CLI

```bash
# Test environment
pnpm run build
npx wrangler pages project create cloudflare-worker-template-test --production-branch=develop

# Production environment
npx wrangler pages project create cloudflare-worker-template-prod --production-branch=main
```

#### Verify Project Creation

```bash
# List all Pages projects
npx wrangler pages project list

# You should see your created project names
```

### Other Cloudflare Resources

Commands, parameters, and `wrangler.*.toml` mapping for other resources (D1 database, R2 buckets, KV namespaces) are in [Quick Start](./QUICKSTART.md).

## 🗄️ Database migrations

```bash
# Test
pnpm run db:migrate:test

# Prod
pnpm run db:migrate:prod
```

## 🚀 Deployment

### Automatic (recommended)

**Test**: push to `develop` for auto deploy

```bash
git checkout develop
git add .
git commit -m "feat: your feature"
git push origin develop
```

**Prod**: push to `main` for auto deploy

```bash
git checkout main
git merge develop
git push origin main
```

### Manual

```bash
pnpm run pages:deploy        # 开发环境
pnpm run pages:deploy:test   # 测试环境
pnpm run pages:deploy:prod   # 生产环境
```

## 🔄 CI/CD

### Continuous Integration (all branches)

On push: tests → ESLint → type‑check → format check → build

### Auto‑deploy

- **Test**: `develop` or `preview` → test → migrate → deploy
- **Prod**: `main` → test → migrate → deploy → report

## 🌐 Custom Domains

1. Cloudflare Dashboard → Pages → 项目 → Custom domains
2. Add domain 并按提示配置 DNS
3. SSL/TLS 证书自动提供

## 📊 Environment Variables

在 Cloudflare Dashboard → Pages → 项目 → Settings → Environment variables 中为不同环境（Production/Preview）添加变量。

## 🔍 Monitoring & Logs

```bash
# List deployments
wrangler pages deployment list

# Live logs
wrangler pages deployment tail

# Worker logs
wrangler tail
```

Analytics: Cloudflare Dashboard → Pages → project → Analytics

## 🔙 Rollback

**Dashboard**: Pages → project → Deployments → select previous → Rollback

**CLI**:

```bash
wrangler pages deployment list
wrangler pages deployment rollback <DEPLOYMENT_ID>
```

## 🐛 Troubleshooting

### Pages Project Not Found Error

**Error message**: `Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`

**Cause**: Pages project has not been created on Cloudflare

**Solution**:

1. Follow the "Create Cloudflare resources" section above to create a Pages project
2. Ensure the project name matches the `name` field in `wrangler.*.toml`
3. Verify project creation: `npx wrangler pages project list`

### Analytics Engine Dataset Error

**Error message**: `Invalid dataset name: prod_analytics_dataset [code: 8000022]`

**Cause**: Analytics Engine is configured but the dataset hasn't been created yet

**Solution (choose one)**:

**Option 1: Use KV Fallback (Recommended, Quick Fix)**

Edit `wrangler.prod.toml`:

```toml
[vars]
ANALYTICS_SINK = "kv"  # Use KV storage for analytics data

# Comment out Analytics Engine binding
# [[analytics_engine_datasets]]
# binding = "ANALYTICS"
# dataset = "prod_analytics_dataset"
```

**Option 2: Create Analytics Engine Dataset**

```bash
# Create the dataset
npx wrangler analytics-engine create prod_analytics_dataset

# Verify
npx wrangler analytics-engine list
```

Then keep `ANALYTICS_SINK = "engine"` in `wrangler.prod.toml`.

### Build failures

Check CI logs and run locally:

```bash
pnpm test && pnpm run type-check && pnpm lint
```

### Database connection failures

Confirm:

1. Correct `database_id` in `wrangler.toml`
2. DB exists and migrations applied

### R2 storage issues

**Error: `Please enable R2 through the Cloudflare Dashboard`**

R2 must be manually enabled in Cloudflare Dashboard:

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com/) → Select account → R2
2. Click `Enable R2` or `Purchase R2` (10GB free tier available)
3. After enabling: `pnpm run r2:create:test` / `pnpm run r2:create:prod`

**Other issues**

Confirm bucket name, created status, and binding config are correct

### 404 after deployment

Confirm `pages_build_output_dir` is `.vercel/output/static`

## ⚡ Performance

**Edge cache**: set `Cache-Control`
**KV cache**: use `withCache()`
**DB**: indexes, pagination, batch ops

See [Development Guide](./DEVELOPMENT.md) for details.

## 💰 Cost Management

### Free quotas

- D1: 5GB storage + 5M reads/day
- R2: 10GB storage (no egress fees)
- Pages: unlimited requests + 500 builds/month
- KV: 100K reads + 1K writes/day

Monitor usage in Cloudflare Dashboard

## 📝 Deployment Checklist

- [ ] Cloudflare Pages projects created (test/production environments)
- [ ] D1 databases created and configured in wrangler.toml
- [ ] R2 buckets created (requires R2 service enabled first)
- [ ] KV namespaces created and configured in wrangler.toml
- [ ] All tests pass
- [ ] Type‑check passes
- [ ] Env vars configured
- [ ] DB migrated
- [ ] GitHub secrets set (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

## 🆘 FAQs

**How to switch environments?**
Push different branches: `develop` → test, `main` → prod

**How to trigger deployment manually?**
GitHub Actions → select workflow → Run workflow

**How to debug failed deployments?**
Review Actions logs; run the same build locally

**How to update DB schema?**
Create a new migration and commit; CI/CD runs it.

## 📚 References

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Deployed successfully!** 🎉
