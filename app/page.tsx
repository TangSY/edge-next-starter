export const runtime = 'edge';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-4xl w-full space-y-8">
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
