export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="container max-w-3xl py-12 prose prose-invert prose-headings:tracking-tight prose-p:text-foreground/85 prose-li:text-foreground/85">
      <p className="eyebrow !mt-0 not-prose">Legal</p>
      <h1 className="!mb-2">Privacy Policy</h1>
      <p className="not-prose font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Last updated 2026-04-28</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account info</strong> — email address you sign up with. Optionally name and avatar from Google OAuth.</li>
        <li><strong>Saved scenarios</strong> — the portfolios you build and save. Public scenarios are visible to anyone with the share link.</li>
        <li><strong>Usage data</strong> — basic logs (IP, user agent, page paths) used for security, rate limiting, and aggregated analytics.</li>
      </ul>

      <h2>What we don&apos;t collect</h2>
      <ul>
        <li>Real brokerage account credentials</li>
        <li>Payment card details (when payments launch, they are handled by Stripe)</li>
        <li>Cross-site tracking pixels or third-party advertising identifiers</li>
        <li>Device fingerprints beyond standard browser headers</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To operate and improve the Service</li>
        <li>To send transactional emails (account confirmation, password reset)</li>
        <li>To prevent abuse and enforce our Terms</li>
      </ul>

      <h2>Third parties</h2>
      <p>We use the following third-party processors:</p>
      <ul>
        <li><strong>Supabase</strong> — database, authentication, file storage</li>
        <li><strong>Vercel</strong> — hosting, analytics</li>
        <li><strong>Google</strong> — OAuth sign-in (only if you choose it)</li>
        <li><strong>Resend</strong> — transactional email</li>
        <li><strong>Stripe</strong> — payments (when paid plans launch)</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies to keep you signed in. We do not use
        third-party tracking cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights under GDPR, CCPA, or
        similar laws including:
      </p>
      <ul>
        <li>Access — request a copy of your data</li>
        <li>Deletion — request we delete your data</li>
        <li>Correction — fix inaccurate data</li>
        <li>Portability — export your data</li>
      </ul>
      <p>
        Email <a href="mailto:hello@diamondhands.space">hello@diamondhands.space</a> to exercise any of these.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain account data while your account is active. Deleted accounts
        are purged within 30 days, except where law requires longer retention.
      </p>

      <h2>Security</h2>
      <p>
        We use industry-standard encryption (HTTPS) and managed services with
        security best practices. No system is perfectly secure; you use the
        Service at your own risk.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. Material changes will be announced via email
        or a banner on the site.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:hello@diamondhands.space">hello@diamondhands.space</a>.
      </p>
    </article>
  );
}
