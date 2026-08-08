import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../../services/api'
import BlogCard from './BlogCard'
import { StaggerGrid, StaggerItem } from '../common/StaggerGrid'
import { AnimatePresence, motion } from 'framer-motion'

// Personalized picks (based on saved/liked categories when logged in, falls
// back to general published articles for guests — see
// blogController.getRecommended). Reuses Home.jsx's .section/.section-title
// classes for a consistent look, since it's always rendered inside Home.
export default function RecommendedArticles() {
  const { data, isLoading } = useQuery({
    queryKey: ['recommendedBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getRecommended()
      return res.data.blogs || res.data
    }
  })

  if (!isLoading && (!data || data.length === 0)) return null

  return (
    <section className="section">
      <div className="section-tag">For you</div>
      <h2 className="section-title">Recommended reading</h2>
      <p className="section-sub">Picked based on what you like to read</p>

      <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ minHeight: 320, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {data.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
          </StaggerGrid>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  )
}
