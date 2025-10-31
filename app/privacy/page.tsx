/**
 * Privacy Policy Page
 * Provides information about data collection, usage, and protection
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Welcome to our service. We respect your privacy and are committed to protecting your
              personal data. This privacy policy will inform you about how we handle your personal
              data when you use our service and tell you about your privacy rights and how the law
              protects you.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> When you register, we collect your email
                address, name, and password (encrypted).
              </li>
              <li>
                <strong>OAuth Information:</strong> If you sign in via Google OAuth, we collect your
                Google account email, name, and profile picture.
              </li>
              <li>
                <strong>Content:</strong> Any data, files, or content you upload or create using our
                service.
              </li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Usage Data:</strong> Information about how you use our service, including
                page views, features accessed, and interaction patterns.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, IP address, and
                device identifiers.
              </li>
              <li>
                <strong>Analytics Data:</strong> We use Cloudflare Analytics to collect anonymous
                usage statistics to improve our service.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Provision:</strong> To provide, maintain, and improve our service
                functionality.
              </li>
              <li>
                <strong>Authentication:</strong> To verify your identity and manage your account.
              </li>
              <li>
                <strong>Communication:</strong> To send you service-related notifications and
                updates.
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and address technical issues, fraud,
                and security threats.
              </li>
              <li>
                <strong>Analytics:</strong> To understand how users interact with our service and
                improve user experience.
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and
                legal processes.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">4.1 Storage Infrastructure</h3>
            <p>Your data is stored using Cloudflare&apos;s global infrastructure:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Database:</strong> Cloudflare D1 (distributed SQLite database)
              </li>
              <li>
                <strong>File Storage:</strong> Cloudflare R2 (object storage)
              </li>
              <li>
                <strong>Cache:</strong> Cloudflare KV (key-value storage)
              </li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.2 Security Measures</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Encryption:</strong> Passwords are encrypted using bcrypt hashing algorithm.
              </li>
              <li>
                <strong>HTTPS:</strong> All data transmission is encrypted using SSL/TLS.
              </li>
              <li>
                <strong>Access Control:</strong> Strict authentication and authorization controls
                protect your data.
              </li>
              <li>
                <strong>Rate Limiting:</strong> Protection against brute force attacks and abuse.
              </li>
            </ul>

            <p className="mt-4">
              While we implement industry-standard security measures, no method of transmission over
              the Internet or electronic storage is 100% secure. We cannot guarantee absolute
              security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              We do not sell your personal data. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> With third-party service providers who perform
                services on our behalf (e.g., Cloudflare for hosting, Google for OAuth
                authentication).
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, legal process, or
                government request.
              </li>
              <li>
                <strong>Protection:</strong> To protect the rights, property, or safety of our
                service, users, or the public.
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                sale of assets, with advance notice.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes
              outlined in this privacy policy, unless a longer retention period is required or
              permitted by law. When you delete your account, we will delete or anonymize your
              personal data, except where we are legally required to retain it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> Request access to your personal data.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete data.
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal data.
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a machine-readable
                format.
              </li>
              <li>
                <strong>Objection:</strong> Object to the processing of your personal data.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent where processing is based on
                consent.
              </li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the information provided in the
              &quot;Contact Us&quot; section.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session Management:</strong> Maintain your login session using JWT tokens.
              </li>
              <li>
                <strong>Analytics:</strong> Understand service usage through Cloudflare Analytics
                (anonymous data).
              </li>
              <li>
                <strong>Security:</strong> Detect and prevent fraudulent activity.
              </li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but disabling certain cookies
              may affect service functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Our service integrates with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google OAuth:</strong> For authentication (Google Privacy Policy applies)
              </li>
              <li>
                <strong>Cloudflare:</strong> For hosting, storage, and analytics (Cloudflare Privacy
                Policy applies)
              </li>
            </ul>
            <p className="mt-4">
              These third parties have their own privacy policies. We encourage you to review them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly
              collect personal data from children under 13. If you are a parent or guardian and
              believe your child has provided us with personal data, please contact us, and we will
              delete such information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Your data may be transferred to and processed in countries other than your country of
              residence. We use Cloudflare&apos;s global network, which replicates data across
              multiple regions for performance and reliability. We ensure that appropriate
              safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new privacy policy on this page and updating the &quot;Last
              updated&quot; date. You are advised to review this privacy policy periodically for any
              changes. Continued use of the service after changes constitutes acceptance of the
              updated privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center gap-4">
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
