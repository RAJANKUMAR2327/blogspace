import { FiGithub } from 'react-icons/fi'

// GitHub OAuth is redirect-based (see server/controllers/authController.js
// githubRedirect/githubCallback) — no SDK needed, just send the browser to
// the server, which sends it to GitHub, which sends it back to
// /auth/callback?token=... (handled by pages/AuthCallback.jsx).
export default function GitHubSignInButton() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const serverUrl = apiBaseUrl.replace(/\/api\/?$/, '')

  return (
    <button
      type="button"
      onClick={() => { window.location.href = `${serverUrl}/api/auth/github` }}
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
      <FiGithub size={17} /> Continue with GitHub
    </button>
  )
}
