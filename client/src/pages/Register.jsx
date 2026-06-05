import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi'

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 6)           s++
  if (pwd.length >= 10)          s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const map = [
    { label: 'Too short',   color: 'bg-red-400' },
    { label: 'Weak',        color: 'bg-red-400' },
    { label: 'Fair',        color: 'bg-yellow-400' },
    { label: 'Good',        color: 'bg-blue-400' },
    { label: 'Strong',      color: 'bg-green-400' },
    { label: 'Very strong', color: 'bg-green-500' },
  ]
  return { score: s, ...map[s] }
}

export default function Register() {
  const { login } = useContext(AuthContext)
  const navigate  = useNavigate()

  const [formData,     setFormData]     = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)

  const strength = getStrength(formData.password)
  const pwdMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match')
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await authAPI.register({ name: formData.name, email: formData.email, password: formData.password })
      login(res.data.user, res.data.token)
      toast.success('🎉 Account created! Welcome to BlogSpace!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400">Join BlogSpace and start reading & writing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                onChange={handleChange} required placeholder="Min 6 characters"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {/* Strength bar */}
            {formData.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange} required
                placeholder="Repeat your password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
              {formData.confirmPassword.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {pwdMatch ? <FiCheck className="text-green-500" /> : <FiX className="text-red-400" />}
                </span>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-70">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
