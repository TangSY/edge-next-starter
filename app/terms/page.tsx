/**
 * Terms of Service Page
 * Provides information about the terms and conditions of using the service
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Terms of Service',
  description: 'Read our terms and conditions for using the service',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Welcome to our service. By accessing or using our service, you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please
              do not use our service.
            </p>
            <p className="mt-4">
              We reserve the right to update or modify these Terms at any time without prior notice.
              Your continued use of the service after any such changes constitutes your acceptance
              of the new Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Our service is a web application built on Next.js and Cloudflare infrastructure,
              providing users with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>User account creation and authentication (email/password and Google OAuth)</li>
              <li>Data storage and management capabilities</li>
              <li>File upload and storage functionality</li>
              <li>API access for application integration</li>
            </ul>
            <p className="mt-4">
              We reserve the right to modify, suspend, or discontinue any aspect of the service at
              any time, with or without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">3.1 Account Registration</h3>
            <p>
              To use certain features of our service, you must register for an account. When
              registering, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.2 Account Eligibility</h3>
            <p>
              You must be at least 13 years old to use this service. By creating an account, you
              represent that you meet this age requirement and have the legal capacity to enter into
              these Terms.
            </p>

            <h3 className="font-semibold mt-4 mb-2">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without
              cause or notice, including if we believe you have violated these Terms. You may also
              delete your account at any time through your account settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. User Content and Conduct</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">4.1 Your Content</h3>
            <p>
              You retain ownership of any content you upload, create, or store using our service
              (&quot;User Content&quot;). By uploading User Content, you grant us a worldwide,
              non-exclusive, royalty-free license to store, process, and display your content solely
              for the purpose of providing the service.
            </p>

            <h3 className="font-semibold mt-4 mb-2">4.2 Prohibited Content</h3>
            <p>You agree not to upload, create, or share content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains malware, viruses, or other harmful code</li>
              <li>Is fraudulent, false, misleading, or deceptive</li>
              <li>Is defamatory, obscene, pornographic, vulgar, or offensive</li>
              <li>Promotes discrimination, bigotry, racism, hatred, harassment, or harm</li>
              <li>Threatens, harasses, or violates the privacy rights of others</li>
              <li>Contains spam, unsolicited advertising, or promotional material</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.3 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the service or related systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated means (bots, scrapers) to access the service without permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Collect or harvest personal data of other users</li>
              <li>Circumvent any security features or access controls</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">5.1 Service Ownership</h3>
            <p>
              The service, including its original content, features, and functionality, is owned by
              us and is protected by international copyright, trademark, patent, trade secret, and
              other intellectual property laws.
            </p>

            <h3 className="font-semibold mt-4 mb-2">5.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to access
              and use the service for your personal or internal business purposes, subject to these
              Terms.
            </p>

            <h3 className="font-semibold mt-4 mb-2">5.3 Restrictions</h3>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of our service without
              our prior written permission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Our service integrates with third-party services including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google OAuth:</strong> For authentication and login
              </li>
              <li>
                <strong>Cloudflare:</strong> For hosting, storage, and infrastructure
              </li>
            </ul>
            <p className="mt-4">
              These third-party services have their own terms of service and privacy policies. We
              are not responsible for the content, privacy practices, or terms of any third-party
              services. Your use of such services is at your own risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Data and Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Your use of the service is also governed by our Privacy Policy. Please review our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your personal data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Service Availability and Modifications</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">8.1 Service Availability</h3>
            <p>
              We strive to provide reliable and continuous service, but we do not guarantee that the
              service will be available at all times. The service may be temporarily unavailable due
              to maintenance, updates, or technical issues. We are not liable for any loss or damage
              resulting from service unavailability.
            </p>

            <h3 className="font-semibold mt-4 mb-2">8.2 Service Modifications</h3>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service at
              any time, including features, functionality, or availability, with or without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Fees and Payment</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Some features of the service may be offered for a fee. If you choose to use paid
              features:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to pay all applicable fees as described at the time of purchase</li>
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>We reserve the right to change our pricing at any time with advance notice</li>
              <li>You are responsible for all taxes associated with your use of paid features</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Disclaimers and Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">10.1 Service Disclaimer</h3>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>

            <h3 className="font-semibold mt-4 mb-2">10.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
              REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your content</li>
            </ul>
            <p className="mt-4">
              IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE
              (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS
              ($100) IF YOU HAVE NOT PAID US ANY AMOUNTS.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              You agree to indemnify, defend, and hold harmless our company, its officers,
              directors, employees, and agents from and against any claims, liabilities, damages,
              losses, and expenses, including reasonable attorneys&apos; fees, arising out of or in
              any way connected with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of the service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">12.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your
              Jurisdiction], without regard to its conflict of law provisions.
            </p>

            <h3 className="font-semibold mt-4 mb-2">12.2 Dispute Resolution Process</h3>
            <p>
              In the event of any dispute arising out of or relating to these Terms or the service,
              the parties agree to first attempt to resolve the dispute through good faith
              negotiations. If the dispute cannot be resolved through negotiations within 30 days,
              either party may pursue legal remedies.
            </p>

            <h3 className="font-semibold mt-4 mb-2">12.3 Jurisdiction</h3>
            <p>
              You agree to submit to the personal and exclusive jurisdiction of the courts located
              in [Your Jurisdiction] for the resolution of any disputes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. General Provisions</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="font-semibold mt-4 mb-2">13.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and us regarding the service and supersede all prior agreements and
              understandings.
            </p>

            <h3 className="font-semibold mt-4 mb-2">13.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining
              provisions shall continue to be valid and enforceable to the fullest extent permitted
              by law.
            </p>

            <h3 className="font-semibold mt-4 mb-2">13.3 Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms shall not be deemed a
              waiver of such right or provision.
            </p>

            <h3 className="font-semibold mt-4 mb-2">13.4 Assignment</h3>
            <p>
              You may not assign or transfer these Terms or your rights hereunder without our prior
              written consent. We may assign these Terms at any time without restriction.
            </p>

            <h3 className="font-semibold mt-4 mb-2">13.5 Force Majeure</h3>
            <p>
              We shall not be liable for any failure to perform our obligations under these Terms
              where such failure results from any cause beyond our reasonable control, including but
              not limited to natural disasters, war, terrorism, riots, embargoes, acts of civil or
              military authorities, fire, floods, or internet outages.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>14. Acknowledgment</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE,
              UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS,
              YOU MUST NOT USE THE SERVICE.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center gap-4">
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
