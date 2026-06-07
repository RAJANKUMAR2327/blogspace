import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi'

export default function Register() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    const levels = [
      { label: '', color: 'transparent' },
      { label: 'Weak', color: '#f87171' },
      { label: 'Fair', color: '#fb923c' },
      { label: 'Good', color: '#facc15' },
      { label: 'Strong', color: '#4ade80' },
    ]
    return { score, ...levels[score] }
  }

  const strength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match')
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await authAPI.register({ name: formData.name, email: formData.email, password: formData.password })
      login(res.data.user, res.data.token)
      toast.success('Account created! Welcome to BlogSpace 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .reg-input {
          width:100%; padding:13px 16px 13px 44px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; font-size:15px; color:#fff; outline:none;
          font-family:'Inter',sans-serif; transition:all 0.2s; box-sizing:border-box;
        }
        .reg-input:focus { border-color:rgba(167,139,250,0.5); background:rgba(167,139,250,0.05); }
        .reg-input::placeholder { color:rgba(255,255,255,0.2); }
        .reg-btn {
          width:100%; padding:14px; border:none; border-radius:10px;
          font-size:15px; font-weight:500; font-family:'Inter',sans-serif;
          cursor:pointer; transition:all 0.25s; display:flex;
          align-items:center; justify-content:center; gap:8px;
          background:linear-gradient(135deg,#7c3aed,#2563eb);
          color:white; box-shadow:0 8px 24px rgba(124,58,237,0.3);
        }
        .reg-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px rgba(124,58,237,0.5); }
        .reg-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .reg-icon { position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.25);font-size:16px; }
        .reg-eye { position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.25);font-size:16px;display:flex;align-items:center;transition:color 0.2s; }
        .reg-eye:hover { color:rgba(255,255,255,0.6); }
      `}</style>

      {/* Left Panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(52,211,153,0.08))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}
        className="hide-mobile">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.15),transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />

        <div style={{ position: 'relative', textAlign: 'center', animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ fontSize: 72, marginBottom: 24, filter: 'drop-shadow(0 0 30px rgba(52,211,153,0.4))', animation: 'float 6s ease-in-out infinite' }}>🚀</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Join BlogSpace
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>
            Join thousands of writers and readers sharing ideas that matter.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              '✦ Free forever — no credit card needed',
              '✦ Publish your first story in minutes',
              '✦ Reach thousands of readers',
              '✦ Save and organize articles you love',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, textAlign: 'left' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', borderLeft: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto' }}>
        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          <Link to="/" style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
            BlogSpace
          </Link>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>Create account</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 32, fontWeight: 300 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <FiUser className="reg-icon" />
                <input className="reg-input" type="text" name="name" value={formData.name}
                  onChange={handleChange} required placeholder="Rajan Kumar" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail className="reg-icon" />
                <input className="reg-input" type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock className="reg-icon" />
                <input className="reg-input" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required placeholder="Min 6 characters"
                  style={{ paddingRight: 44 }} />
                <button type="button" className="reg-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <FiLock className="reg-icon" />
                <input className="reg-input" type={showPassword ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Repeat your password" style={{ paddingRight: 44 }} />
                {formData.confirmPassword && (
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: passwordsMatch ? '#4ade80' : '#f87171' }}>
                    {passwordsMatch ? <FiCheck /> : '✗'}
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className="reg-btn" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating account...' : <>Create account <FiArrowRight /></>}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
