/**
 * 受保护的示例页面 - 仪表板
 * 仅已登录用户可访问
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">仪表板</h1>
            <p className="text-muted-foreground mt-2">
              欢迎回来, {session.user.name || session.user.email}!
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline">
              退出登录
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
              <CardDescription>您的账户详情</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">邮箱:</span>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">用户名:</span>
                <p className="text-muted-foreground">{session.user.name || '未设置'}</p>
              </div>
              <div>
                <span className="text-sm font-medium">用户 ID:</span>
                <p className="text-muted-foreground">{session.user.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/profile">编辑个人资料</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>会话信息</CardTitle>
            <CardDescription>当前登录会话详情</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
