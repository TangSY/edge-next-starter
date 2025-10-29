/**
 * 用户档案页，展示基本信息并提供占位说明
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information. This
            starter模板仅提供示例布局，可在此基础上扩展提交表单等功能。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>当前登录用户信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium">邮箱</span>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium">昵称</span>
              <p className="text-muted-foreground">{session.user.name || '未设置'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">用户 ID</span>
              <p className="text-muted-foreground">{session.user.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">头像</span>
              <p className="text-muted-foreground">
                {session.user.image || '未上传头像，可在此处接入上传功能'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>接下来可以做什么？</CardTitle>
            <CardDescription>
              按需扩展表单提交、头像上传、OAuth 绑定等功能，完善真实项目场景。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">返回仪表盘</Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
