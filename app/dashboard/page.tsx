/**
 * Protected Example Page - Dashboard
 * Only accessible to logged-in users
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {session.user.name || session.user.email}!
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Username:</span>
                <p className="text-muted-foreground">{session.user.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm font-medium">User ID:</span>
                <p className="text-muted-foreground">{session.user.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common functions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Current login session details</CardDescription>
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
