import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">BlogSpace</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              A place to read, write, and connect with great thinkers and storytellers.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><FiTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><FiGithub size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><FiLinkedin size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/blogs" className="hover:text-purple-600 transition-colors">All Blogs</Link></li>
              <li><Link to="/categories" className="hover:text-purple-600 transition-colors">Categories</Link></li>
              <li><Link to="/search" className="hover:text-purple-600 transition-colors">Search</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/login" className="hover:text-purple-600 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-purple-600 transition-colors">Register</Link></li>
              <li><Link to="/profile" className="hover:text-purple-600 transition-colors">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} BlogSpace. All rights reserved.
        </div>
      </div>
    </footer>
  )
}