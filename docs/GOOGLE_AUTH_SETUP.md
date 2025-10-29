# Google OAuth Login Setup Guide

## Configuration Steps

### 1. Create a Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "edge-next-starter")
4. Click "Create"

### 2. Configure OAuth Consent Screen

1. In the left menu, select "APIs & Services" → "OAuth consent screen"
2. User type: **External**
3. App name / support email / developer email：填写项目相关信息
4. Scopes：保持默认（无需选择额外 scope）
5. Test users：添加用于测试的 Google 账号
6. 点击 “Save and Continue” 直至完成

> ✅ 新版 Google Identity Services 不再需要启用 Google+ API，保持默认即可。

### 3. Create OAuth 2.0 Credentials

1. In the left menu, select "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If this is your first time, you'll need to configure the "OAuth consent screen":
   - User type: External
   - App name: edge-next-starter
   - User support email: your email
   - Developer contact information: your email
   - Click "Save and Continue"
   - Scopes: No need to add, click "Save and Continue"
   - Test users: Add your Google account for testing
   - Click "Save and Continue"

4. Return to the "Credentials" page, click "Create Credentials" → "OAuth client ID"
5. Application type: Web application
6. Name: edge-next-starter-web
7. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
8. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
9. Click "Create"
10. **Copy the Client ID and Client Secret**

### 4. Configure Environment Variables

Edit your `.env.local` file:

```bash
# Uncomment and fill in your credentials
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

> 提示：`GOOGLE_CLIENT_ID` 与 `GOOGLE_CLIENT_SECRET` 必须同时配置，否则环境校验会失败。

### 5. Test the Login

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Visit the login page: http://localhost:3000/login

3. Click the "Google" button

4. Select your Google account to sign in

5. First-time login will prompt for authorization, click "Allow"

6. After successful login, you'll be redirected to the homepage

## Data Flow

```
User clicks Google login
    ↓
Redirect to Google login page
    ↓
User authorizes
    ↓
Google callback to /api/auth/callback/google
    ↓
NextAuth processes callback
    ↓
Create record in accounts table
    ↓
Create/find user in users table
    ↓
Create JWT session
    ↓
Redirect to homepage
```

## Database Changes

First-time Google login creates records in the database:

**users table**:

```sql
INSERT INTO users (email, name, image, email_verified)
VALUES ('user@gmail.com', 'User Name', 'https://...', 1234567890);
```

**accounts table**:

```sql
INSERT INTO accounts (user_id, type, provider, provider_account_id, ...)
VALUES (1, 'oauth', 'google', '1234567890', ...);
```

## Common Issues

### 1. Error: redirect_uri_mismatch

**Cause**: Redirect URI doesn't match

**Solution**:

- Check if the redirect URI in Google Console includes:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Ensure `NEXTAUTH_URL` in `.env.local` is correct

### 2. Error: access_denied

**Cause**: User not authorized or not added to test user list

**Solution**:

- Add your Google account as a test user in the OAuth consent screen

### 3. Login successful but no redirect

**Cause**: `NEXTAUTH_URL` configuration error

**Solution**:

- Ensure `.env.local` is configured with:
  ```
  NEXTAUTH_URL=http://localhost:3000
  ```

### 4. Production Deployment

When deploying to production:

1. Add production domain in Google Console:

   ```
   https://your-domain.com
   https://your-domain.com/api/auth/callback/google
   ```

2. Configure environment variables in Cloudflare Pages (prefer `wrangler secret put ...` for sensitive values):
   ```
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Security Recommendations

1. **Don't commit credentials**:
   - `.env.local` is already in `.gitignore`
   - Never commit credentials to Git

2. **Rotate keys regularly**:
   - Recommend rotating client secret every 6 months

3. **Limit scopes**:
   - Only request necessary permissions (currently only basic info)

4. **Monitor suspicious logins**:
   - Monitor API usage in Google Console

## Reference Documentation

- [NextAuth Google Provider](https://authjs.dev/getting-started/providers/google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
