import { useState } from 'react'
import { newsletterAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await newsletterAPI.subscribe(email)
      toast.success('Successfully subscribed!')
      setEmail('')
    } catch {
      toast.error('Subscription failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-purple-600 dark:bg-purple-800 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Stay in the Loop</h2>
        <p className="text-purple-100 mb-8">Get the best articles delivered to your inbox every week.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-5 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-70"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  )
}