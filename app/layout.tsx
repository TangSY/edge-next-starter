import type { Metadata } from 'next';
import './globals.css';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Next.js on Cloudflare',
  description: 'Next.js application running on Cloudflare Workers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
