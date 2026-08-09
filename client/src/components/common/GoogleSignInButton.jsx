import { FcGoogle } from 'react-icons/fc'

// Google OAuth is redirect-based (see server/controllers/authController.js
// googleRedirect/googleCallback) — no SDK needed, just send the browser to
// the server, which sends it to Google with prompt=select_account, which
// sends it back to /auth/callback?token=... (handled by pages/AuthCallback.jsx).
//
// This deliberately replaces the old Google Identity Services JS button.
// That SDK button can silently show a personalized "Continue as [name]"
// chip for whichever Google account is already active in the visitor's
// browser, skipping the account picker. The redirect flow below always
// forces Google's account chooser to appear, the same way GitHub sign-in
// already works on this site.
export default function GoogleSignInButton() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const serverUrl = apiBaseUrl.replace(/\/api\/?$/, '')

  return (
    <button
      type="button"
      onClick={() => { window.location.href = `${serverUrl}/api/auth/google` }}
      style={{
        width: '100%', padding: '12px', borderRadius: 10,
        border: '1px solid var(--border-strong)', background: 'var(--bg-surface)',
        color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
        fontFamily: 'var(--font-ui)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
    >
      <FcGoogle size={18} /> Continue with Google
    </button>
  )
}
