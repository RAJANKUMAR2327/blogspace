import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import GoogleSignInButton from '../components/common/GoogleSignInButton'
import GitHubSignInButton from '../components/common/GitHubSignInButton'
import { getRecaptchaToken } from '../utils/recaptcha'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [twoFactorTempToken, setTwoFactorTempToken] = useState(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken('login')
      const res = await authAPI.login({ ...formData, recaptchaToken })
      if (res.data.requires2FA) {
        setTwoFactorTempToken(res.data.tempToken)
        return
      }
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTwoFactor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.verifyLoginTwoFactor(twoFactorTempToken, twoFactorCode)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .login-input {
          width:100%; padding:13px 16px 13px 44px;
          background: var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:10px; font-size:15px;
          color: var(--text-primary); outline:none;
          font-family:var(--font-ui);
          transition:all 0.2s; box-sizing:border-box;
        }
        .login-input:focus { border-color: var(--accent); }
        .login-input::placeholder { color: var(--text-tertiary); }
        .login-btn {
          width:100%; padding:14px; border:none; border-radius:10px;
          font-size:15px; font-weight:500; font-family:var(--font-ui);
          cursor:pointer; transition:all 0.25s; display:flex;
          align-items:center; justify-content:center; gap:8px;
          background: var(--accent);
          color: var(--text-on-accent); box-shadow: var(--shadow-pop);
        }
        .login-btn:hover:not(:disabled) { background: var(--accent-strong); }
        .login-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .icon-wrap { position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);font-size:16px; }
        .eye-btn { position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:16px;display:flex;align-items:center;transition:color 0.2s; }
        .eye-btn:hover { color: var(--text-primary); }
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { max-width: 100% !important; border-left: none !important; }
        }
        @media (max-width: 480px) {
          .login-right-panel { padding: 40px 24px !important; }
        }  
      `}</style>

      {/* Left Panel — Decorative */}
      <div className="login-left-panel" style={{ flex: 1, background: 'var(--accent-soft)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Grid dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 25%, transparent), transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />

        <div style={{ position: 'relative', textAlign: 'center', animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 24, color: 'var(--accent)', animation: 'float 6s ease-in-out infinite' }}>✦</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 320, fontWeight: 400 }}>
            Sign in to access your stories, saved articles, and personalized feed.
          </p>

          {/* Features */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📖', text: 'Access all your saved articles' },
              { icon: '✍️', text: 'Continue writing your drafts' },
              { icon: '🔔', text: 'Get personalized recommendations' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right-panel" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', borderLeft: '1px solid var(--border-soft)' }}>
        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          {/* Logo */}
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
            BlogSpace
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            {twoFactorTempToken ? 'Enter your code' : 'Sign in'}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', marginBottom: 36, fontWeight: 400 }}>
            {twoFactorTempToken ? (
              'Open your authenticator app and enter the 6-digit code'
            ) : (
              <>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Get started free</Link>
              </>
            )}
          </p>

          {twoFactorTempToken ? (
            <form onSubmit={handleVerifyTwoFactor} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Verification code</label>
                <input
                  className="login-input"
                  type="text"
                  autoComplete="one-time-code"
                  maxLength={9}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, ''))}
                  required
                  autoFocus
                  placeholder="123456"
                  style={{ textAlign: 'center', fontSize: 'var(--text-xl)', letterSpacing: '4px', fontFamily: 'monospace' }}
                />
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                  Enter the 6-digit code from your app, or one of your backup codes
                </p>
              </div>
              <button type="submit" className="login-btn" disabled={loading || twoFactorCode.length < 6}>
                {loading ? 'Verifying...' : <>Verify <FiArrowRight /></>}
              </button>
              <button
                type="button"
                onClick={() => { setTwoFactorTempToken(null); setTwoFactorCode('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'center' }}
              >
                ← Back to login
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail className="icon-wrap" />
                <input className="login-input" type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock className="icon-wrap" />
                <input className="login-input" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required placeholder="••••••••"
                  style={{ paddingRight: 44 }} />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign in <FiArrowRight /></>}
            </button>
          </form>
          )}

          {!twoFactorTempToken && (
          <>
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
          </div>

          <GoogleSignInButton />
          
          <div style={{ marginTop: 10 }}>
            <GitHubSignInButton />
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}