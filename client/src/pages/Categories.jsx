import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'

const CATEGORIES = [
  { name: 'Technology',   emoji: '💻', desc: 'Latest in tech, gadgets and software' },
  { name: 'Programming',  emoji: '🧑‍💻', desc: 'Code, tutorials and dev tools' },
  { name: 'Design',       emoji: '🎨', desc: 'UI/UX, graphics and visual arts' },
  { name: 'Business',     emoji: '💼', desc: 'Startups, finance and entrepreneurship' },
  { name: 'Science',      emoji: '🔬', desc: 'Discoveries, research and innovation' },
  { name: 'Health',       emoji: '🏥', desc: 'Wellness, fitness and mental health' },
  { name: 'Travel',       emoji: '✈️', desc: 'Adventures, destinations and tips' },
  { name: 'Food',         emoji: '🍳', desc: 'Recipes, restaurants and cuisines' },
  { name: 'Lifestyle',    emoji: '🌟', desc: 'Fashion, home and personal growth' },
  { name: 'Other',        emoji: '📌', desc: 'Everything else worth reading' },
]

export default function Categories() {
  const { data } = useQuery({
    queryKey: ['allBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data.blogs
    }
  })

  // Count blogs per category
  const countMap = {}
  data?.forEach(blog => {
    countMap[blog.category] = (countMap[blog.category] || 0) + 1
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Browse Categories
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Find articles on topics that interest you
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CATEGORIES.map(({ name, emoji, desc }) => (
          <Link
            key={name}
            to={`/blogs?category=${name}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl mb-3">{emoji}</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {desc}
            </p>
            <span className="inline-block text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
              {countMap[name] || 0} articles
            </span>
          </Link>
        ))}
      </div>

      {/* All Articles Link */}
      <div className="text-center mt-12">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors font-medium"
        >
          View All Articles →
        </Link>
      </div>
    </div>
  )
}
