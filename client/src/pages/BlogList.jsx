import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import { FiSearch, FiFilter } from 'react-icons/fi'

const CATEGORIES = [
  'All', 'Technology', 'Programming', 'Design',
  'Business', 'Science', 'Health', 'Travel', 'Food', 'Lifestyle', 'Other'
]

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page, category, search],
    queryFn: async () => {
      const res = await blogAPI.getAll({
        page,
        limit: 9,
        ...(category && { category }),
        ...(search && { search })
      })
      return res.data
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ search, page: 1 })
  }

  const handleCategory = (cat) => {
    setSearchParams({ category: cat === 'All' ? '' : cat, page: 1 })
  }

  const handlePage = (newPage) => {
    setSearchParams({ page: newPage, ...(category && { category }) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">All Articles</h1>
        <p className="text-gray-500 dark:text-gray-400">Explore ideas across every topic</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button type="submit"
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
          <FiSearch /> Search
        </button>
      </form>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (category === cat || (cat === 'All' && !category))
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : data?.blogs?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📭</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No articles found</h3>
          <p className="text-gray-500">Try a different search or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.blogs?.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ← Previous
              </button>
              {[...Array(data.pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePage(i + 1)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    page === i + 1
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page === data.pagination.pages}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}