import { describe, it, expect } from 'vitest';
import { GET } from '../../app/api/auth/route';

function createRequest(url: string, headers?: Record<string, string>) {
  const hdrs = new Headers(headers || {});
  return {
    method: 'GET',
    headers: {
      get(name: string) {
        return hdrs.get(name) as string | null;
      },
    },
    url,
  } as unknown as Request;
}

describe('Auth Route', () => {
  it('should return 401 when Authorization header is missing', async () => {
    const req = createRequest('http://localhost/api/auth');
    const res = await GET(req as any);
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.type).toBe('AUTHENTICATION_ERROR');
  });

  it('should return 401 for invalid token', async () => {
    const req = createRequest('http://localhost/api/auth', {
      authorization: 'Bearer short',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.type).toBe('INVALID_CREDENTIALS');
  });

  it('should return 401 for expired token', async () => {
    const req = createRequest('http://localhost/api/auth', {
      authorization: 'Bearer verylongtoken.expired',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.type).toBe('TOKEN_EXPIRED');
  });

  it('should return 403 when role is insufficient', async () => {
    const req = createRequest('http://localhost/api/auth?role=admin', {
      authorization: 'Bearer somereallylongtoken.user',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(403);
    const body: any = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.type).toBe('AUTHORIZATION_ERROR');
  });

  it('should return 200 when authorized with required role', async () => {
    const req = createRequest('http://localhost/api/auth?role=editor', {
      authorization: 'Bearer somereallylongtoken.editor',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.ok).toBe(true);
    expect(body.data.role).toBe('editor');
  });
});
