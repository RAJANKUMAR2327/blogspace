import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Service" description="The terms that govern your use of BlogSpace." />
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 96px' }}>
          <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none' }}>← Back to home</Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0 8px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 40 }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.75, fontFamily: 'var(--font-body)' }}>
            <p style={{ marginBottom: 24 }}>
              By creating an account or using BlogSpace, you agree to these terms. Please read them
              before publishing content or interacting with other users.
            </p>

            <Section title="1. Your Account">
              <p>
                You're responsible for keeping your account credentials secure and for all activity
                that happens under your account. You must provide accurate information when
                registering and are responsible for keeping it up to date.
              </p>
            </Section>

            <Section title="2. Content You Publish">
              <p>
                You retain ownership of everything you write and publish on BlogSpace. By publishing,
                you grant BlogSpace a license to host, display, and distribute your content on the
                platform so other readers can access it.
              </p>
              <p>You agree not to publish content that:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <li>Is illegal, defamatory, or infringes someone else's intellectual property</li>
                <li>Contains malware, phishing links, or spam</li>
                <li>Harasses, threatens, or targets other individuals</li>
                <li>Impersonates another person or organization</li>
              </ul>
            </Section>

            <Section title="3. Comments and Community">
              <p>
                Comments should stay on-topic and respectful. Admins reserve the right to remove
                comments or content, and to suspend or ban accounts, that violate these terms.
              </p>
            </Section>

            <Section title="4. AI-Generated Content">
              <p>
                BlogSpace offers optional AI tools (title suggestions, summaries, grammar checks, and
                full article drafts) powered by Google Gemini. If you use these tools, you're
                responsible for reviewing and editing the output before publishing — AI-generated text
                can be inaccurate and should be fact-checked like any other source.
              </p>
            </Section>

            <Section title="5. Acceptable Use">
              <p>You agree not to:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <li>Attempt to access accounts or data that isn't yours</li>
                <li>Use automated tools to scrape or overload the platform</li>
                <li>Circumvent rate limits, security measures, or admin restrictions</li>
                <li>Use the platform for any unlawful purpose</li>
              </ul>
            </Section>

            <Section title="6. Termination">
              <p>
                We may suspend or terminate accounts that violate these terms. You may delete your
                account at any time by contacting us.
              </p>
            </Section>

            <Section title="7. No Warranty">
              <p>
                BlogSpace is provided "as is." We aim for reliability but don't guarantee the platform
                will be uninterrupted, error-free, or available at all times.
              </p>
            </Section>

            <Section title="8. Changes to These Terms">
              <p>
                We may update these terms from time to time. Continued use of BlogSpace after changes
                are posted means you accept the revised terms.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>Questions about these terms? Reach out via the contact details on our homepage.</p>
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
