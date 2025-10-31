/**
 * Profile page that surfaces basic account information and placeholder guidance.
 */

import { auth } from '@/lib/auth/config';
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
            Manage your personal information. This starter keeps the layout simple—extend it with
            profile forms, upload workflows, or any other bespoke actions your product needs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Details for the currently authenticated user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium">Email</span>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Display Name</span>
              <p className="text-muted-foreground">{session.user.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">User ID</span>
              <p className="text-muted-foreground">{session.user.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Avatar</span>
              <p className="text-muted-foreground">
                {session.user.image ||
                  'No avatar uploaded yet—hook in your preferred uploader here.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where to go next?</CardTitle>
            <CardDescription>
              Plug in profile edits, avatar flows, OAuth linking, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
