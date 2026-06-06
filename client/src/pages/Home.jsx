import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import Newsletter from '../components/common/Newsletter'
import SEO from '../components/common/SEO'
import { FiArrowRight, FiBookOpen, FiUsers, FiEdit, FiTrendingUp, FiZap } from 'react-icons/fi'

const CATEGORIES = [
  { name: 'Technology',  emoji: '💻' },
  { name: 'Programming', emoji: '🧑‍💻' },
  { name: 'Design',      emoji: '🎨' },
  { name: 'Business',    emoji: '💼' },
  { name: 'Health',      emoji: '🏥' },
  { name: 'Travel',      emoji: '✈️' },
]

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl mb-4" />
    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2" />
    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2" />
    <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2" />
  </div>
)

export default function Home() {
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['featuredBlogs'],
    queryFn: () => blogAPI.getAll({ limit: 6 }).then(r => r.data)
  })

  const { data: trendingData } = useQuery({
    queryKey: ['trendingBlogs'],
    queryFn: () => blogAPI.getTrending().then(r => r.data)
  })

  return (
    <div>
      <SEO title="Home" description="Discover stories and ideas from expert writers on BlogSpace" />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 py-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            ✨ Welcome to BlogSpace
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Ideas Worth{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Reading
            </span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover stories, thinking, and expertise from writers on any topic that matters to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/blogs"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-none">
              <FiBookOpen /> Start Reading
            </Link>
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <FiEdit /> Start Writing
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              { icon: FiBookOpen, label: 'Articles', value: blogsData?.pagination?.total || '0' },
              { icon: FiUsers,    label: 'Writers',  value: '100+' },
              { icon: FiEdit,     label: 'Topics',   value: '10+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center mt-1">
                  <Icon size={14} /> {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Topic</h2>
          <Link to="/categories" className="text-purple-600 dark:text-purple-400 hover:underline text-sm flex items-center gap-1">
            All categories <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(({ name, emoji }) => (
            <Link key={name} to={`/blogs?category=${name}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:shadow-sm">
              <span>{emoji}</span>{name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Latest Articles ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Articles</h2>
          <Link to="/blogs" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : blogsData?.blogs?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No articles yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogsData?.blogs?.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* ── Trending Articles (NEW) ──────────────────────────────── */}
      {trendingData?.blogs?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingData.blogs.map((blog, i) => (
              <Link key={blog._id} to={`/blog/${blog.slug}`}
                className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <span className="text-4xl font-bold text-purple-100 dark:text-purple-900/60 w-12 flex-shrink-0 leading-none pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    {blog.category}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-2">
                    <FiZap size={10} /> {blog.views?.toLocaleString()} views · {blog.readTime}m read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Newsletter />
    </div>
  )
}