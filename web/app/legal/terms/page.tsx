export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="container max-w-3xl py-12 prose prose-invert prose-headings:tracking-tight">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: 2026-04-28</p>

      <p>
        By accessing or using DiamondHands (&quot;the Service&quot;), you agree to
        these Terms of Service. If you do not agree, do not use the Service.
      </p>

      <h2>1. Service description</h2>
      <p>
        DiamondHands offers educational tools for backtesting investment
        portfolios and simulating paper trades. We do not provide investment
        advice, brokerage, or asset custody. See our{" "}
        <a href="/legal/disclaimer">Disclaimer</a> for more.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority where you
        live) to create an account.
      </p>

      <h2>3. Account responsibilities</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>You agree to provide accurate information during sign-up.</li>
        <li>One person per account; no sharing logins.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Scrape, mirror, or systematically extract data from the Service</li>
        <li>Resell or redistribute price data obtained via the Service</li>
        <li>Reverse engineer, decompile, or attempt to derive source code</li>
        <li>Interfere with the Service&apos;s operation, security, or other users</li>
        <li>Use the Service to provide investment advice to third parties</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        The Service&apos;s code, design, and content (excluding user-generated
        scenarios) belong to DiamondHands. Public scenarios you save are
        viewable by anyone with the share link.
      </p>

      <h2>6. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless DiamondHands, its operators,
        and contributors from any claim arising out of your use of the Service
        or your violation of these Terms.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, DIAMONDHANDS&apos; TOTAL LIABILITY
        ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU
        PAID FOR THE SERVICE IN THE 12 MONTHS PRIOR TO THE CLAIM (typically $0
        for free users).
      </p>
      <p>
        IN NO EVENT SHALL DIAMONDHANDS BE LIABLE FOR INDIRECT, CONSEQUENTIAL,
        SPECIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST
        PROFITS, INVESTMENT LOSSES, OR LOST OPPORTUNITIES.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms. You may
        delete your account at any time from your dashboard.
      </p>

      <h2>9. Changes to terms</h2>
      <p>
        We may update these Terms from time to time. Continued use after
        changes constitutes acceptance.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, USA,
        without regard to conflict of laws principles.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:harsh2995@gmail.com">harsh2995@gmail.com</a>.
      </p>
    </article>
  );
}
