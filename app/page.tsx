import { auth } from '@/lib/auth/config';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { handleSignOut } from '@/app/actions/auth';

export const runtime = 'edge';

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col p-8">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center max-w-6xl mx-auto w-full mb-12">
        <h1 className="text-xl font-bold">Edge Next Starter</h1>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-muted-foreground">{session.user.email}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <form action={handleSignOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto space-y-8 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Next.js on Cloudflare</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A production-ready template with Edge Runtime, Workers, D1, and R2
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Edge Runtime</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Lightning-fast responses from Cloudflare&apos;s global network
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">D1 Database</h2>
            <p className="text-gray-600 dark:text-gray-400">Serverless SQL database at the edge</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">R2 Storage</h2>
            <p className="text-gray-600 dark:text-gray-400">Object storage without egress fees</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Auto Deployment</h2>
            <p className="text-gray-600 dark:text-gray-400">CI/CD pipeline with GitHub Actions</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/api/health"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Check API Health
          </a>
        </div>
      </main>
    </div>
  );
}
