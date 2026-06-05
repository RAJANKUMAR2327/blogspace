import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <h1 className="text-8xl font-bold text-purple-600 mb-4">404</h1>
      <p className="text-gray-500 mb-8">Page not found.</p>
      <Link to="/" className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700">Go Home</Link>
    </div>
  )
}