import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy" description="How BlogSpace collects, uses, and protects your data." />
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 96px' }}>
          <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none' }}>← Back to home</Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0 8px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 40 }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.75, fontFamily: 'var(--font-body)' }}>
            <p style={{ marginBottom: 24 }}>
              This Privacy Policy explains what information BlogSpace collects when you use this
              platform, how it's used, and the choices you have about it.
            </p>

            <Section title="1. Information We Collect">
              <p><strong style={{ color: 'var(--text-primary)' }}>Account information:</strong> when you register, we collect your name, email address, and password (stored as a secure hash, never in plain text). If you sign in with Google or GitHub, we receive your name, email, and profile picture from that provider.</p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Content you create:</strong> articles, comments, and any images you upload.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Usage data:</strong> pages you visit, articles you read, and searches you make, so we can show you relevant recommendations and measure how the platform is used.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Technical data:</strong> IP address, browser type, and device information, primarily for security (detecting suspicious login activity) and debugging.
              </p>
            </Section>

            <Section title="2. How We Use Your Information">
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>To create and manage your account</li>
                <li>To show you articles and recommendations relevant to your interests</li>
                <li>To send you emails you've opted into, like the weekly digest or comment replies</li>
                <li>To detect and prevent abuse, spam, and unauthorized access</li>
                <li>To improve the platform based on how it's actually used</li>
              </ul>
            </Section>

            <Section title="3. Third-Party Services">
              <p>We use a small number of third-party services to run BlogSpace, each of which processes limited data on our behalf:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Cloudinary</strong> — stores and serves uploaded images</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Google / GitHub</strong> — for optional sign-in</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Google Gemini</strong> — powers AI writing features (titles, summaries, grammar checks); article text you submit to these tools is processed to generate a response</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Email provider</strong> — delivers verification, password reset, and digest emails</li>
              </ul>
            </Section>

            <Section title="4. Cookies">
              <p>
                We use essential cookies to keep you signed in (a secure, HTTP-only refresh token) and
                a lightweight session identifier to understand anonymous site usage. We don't use
                third-party advertising or tracking cookies.
              </p>
            </Section>

            <Section title="5. Your Choices">
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>You can edit or delete your saved articles and reading history from your profile at any time</li>
                <li>You can unsubscribe from the newsletter using the link in any digest email</li>
                <li>You can request account deletion by contacting us — this removes your personal data, though published articles may be anonymized rather than deleted to preserve discussion threads</li>
              </ul>
            </Section>

            <Section title="6. Data Security">
              <p>
                Passwords are hashed with bcrypt and never stored in plain text. We use HTTPS for all
                traffic, and access to admin functions is restricted by role. No system is perfectly
                secure, but we take reasonable, industry-standard steps to protect your data.
              </p>
            </Section>

            <Section title="7. Changes to This Policy">
              <p>
                If this policy changes materially, we'll update the "last updated" date above. Continued
                use of BlogSpace after changes means you accept the revised policy.
              </p>
            </Section>

            <Section title="8. Contact">
              <p>Questions about this policy or your data? Reach out via the contact details on our homepage.</p>
            </Section>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
