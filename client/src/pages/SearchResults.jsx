import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import { FiSearch } from 'react-icons/fi'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') || '')
  const query = searchParams.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { blogs: [] }
      const res = await blogAPI.getAll({ search: query, limit: 20 })
      return res.data
    },
    enabled: !!query
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search articles, topics, tags..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-8 py-4 rounded-2xl hover:bg-purple-700 transition-colors font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Header */}
      {query && (
        <div className="mb-8">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Searching for "{query}"...</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Found{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {data?.blogs?.length || 0}
              </span>{' '}
              results for{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                "{query}"
              </span>
            </p>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Query State */}
      {!query && !isLoading && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Start searching
          </h2>
          <p className="text-gray-500">Type something above to find articles</p>
        </div>
      )}

      {/* No Results */}
      {query && !isLoading && data?.blogs?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No results found
          </h2>
          <p className="text-gray-500 mb-6">
            No articles matched "{query}". Try different keywords.
          </p>
          <Link
            to="/blogs"
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Browse all articles →
          </Link>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && data?.blogs?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}
