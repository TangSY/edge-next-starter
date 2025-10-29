# Google OAuth 登录配置指南

## 配置步骤

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击"选择项目" → "新建项目"
3. 输入项目名称（如 "edge-next-starter"）
4. 点击"创建"

### 2. 配置 OAuth Consent Screen

1. 在左侧菜单中，选择"API 和服务" → "OAuth Consent Screen"
2. 用户类型选择 **External（外部）**
3. 填写应用名称、支持邮箱、开发者邮箱等信息
4. 作用域保持默认即可
5. 测试用户添加用于调试的 Google 账号
6. 连续点击"保存并继续"完成配置

> ✅ 新版 Google Identity Services 无需启用 Google+ API，保持默认即可。

### 3. 创建 OAuth 2.0 凭据

1. 在左侧菜单中，选择"API 和服务" → "凭据"
2. 点击"创建凭据" → "OAuth 客户端 ID"
3. 如果是首次创建，需要先配置"OAuth Consent Screen"：
   - 用户类型：外部
   - 应用名称：edge-next-starter
   - 用户支持电子邮件：你的邮箱
   - 开发者联系信息：你的邮箱
   - 点击"保存并继续"
   - 作用域：不需要添加，直接"保存并继续"
   - 测试用户：添加你的 Google 账号用于测试
   - 点击"保存并继续"

4. 返回"凭据"页面，点击"创建凭据" → "OAuth 客户端 ID"
5. 应用类型：Web 应用
6. 名称：edge-next-starter-web
7. 已获授权的 JavaScript 来源：
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
8. 已获授权的重定向 URI：
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
9. 点击"创建"
10. **复制客户端 ID 和客户端密钥**

### 4. 配置环境变量

编辑 `.env.local` 文件：

```bash
# 取消注释并填入你的凭据
GOOGLE_CLIENT_ID=你的客户端ID
GOOGLE_CLIENT_SECRET=你的客户端密钥
```

> 小贴士：`GOOGLE_CLIENT_ID` 与 `GOOGLE_CLIENT_SECRET` 必须成对配置，否则环境校验会报错。

### 5. 测试登录

1. 启动开发服务器：

   ```bash
   pnpm dev
   ```

2. 访问登录页面：http://localhost:3000/login

3. 点击 "Google" 按钮

4. 选择你的 Google 账号登录

5. 首次登录会提示授权，点击"允许"

6. 登录成功后会跳转到首页

## 数据流程

```
用户点击 Google 登录
    ↓
跳转到 Google 登录页面
    ↓
用户授权
    ↓
Google 回调 /api/auth/callback/google
    ↓
NextAuth 处理回调
    ↓
在 accounts 表创建记录
    ↓
在 users 表创建/查找用户
    ↓
创建 JWT 会话
    ↓
跳转到首页
```

## 数据库变化

首次 Google 登录会在数据库中创建：

**users 表**：

```sql
INSERT INTO users (email, name, image, email_verified)
VALUES ('user@gmail.com', 'User Name', 'https://...', 1234567890);
```

**accounts 表**：

```sql
INSERT INTO accounts (user_id, type, provider, provider_account_id, ...)
VALUES (1, 'oauth', 'google', '1234567890', ...);
```

## 常见问题

### 1. 错误：redirect_uri_mismatch

**原因**：重定向 URI 不匹配

**解决**：

- 检查 Google Console 中的重定向 URI 是否包含：
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- 确保 `.env.local` 中的 `NEXTAUTH_URL` 正确

### 2. 错误：access_denied

**原因**：用户未授权或未添加到测试用户列表

**解决**：

- 在 OAuth Consent Screen 中添加你的 Google 账号为测试用户

### 3. 登录成功但没有跳转

**原因**：`NEXTAUTH_URL` 配置错误

**解决**：

- 确保 `.env.local` 中配置：
  ```
  NEXTAUTH_URL=http://localhost:3000
  ```

### 4. 生产环境部署

部署到生产环境时：

1. 在 Google Console 添加生产域名：

   ```
   https://your-domain.com
   https://your-domain.com/api/auth/callback/google
   ```

2. 在 Cloudflare Pages 环境变量中配置（敏感值推荐使用 `wrangler secret put ...`）：
   ```
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=你的客户端ID
   GOOGLE_CLIENT_SECRET=你的客户端密钥
   ```

## 安全建议

1. **不要提交凭据**：
   - `.env.local` 已在 `.gitignore` 中
   - 永远不要将凭据提交到 Git

2. **定期轮换密钥**：
   - 建议每 6 个月轮换一次客户端密钥

3. **限制作用域**：
   - 只请求必要的权限（当前仅请求基本信息）

4. **监控异常登录**：
   - 在 Google Console 中监控 API 使用情况

## 参考文档

- [NextAuth Google Provider](https://authjs.dev/getting-started/providers/google)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
