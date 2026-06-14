import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../../services/api'
import { FiTrendingUp, FiEye, FiHeart } from 'react-icons/fi'

export default function TrendingPosts() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await blogAPI.getTrending()
      return res.data.blogs
    }
  })

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.04)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FiTrendingUp style={{ color: '#f472b6', fontSize: 16 }} />
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>
          Trending Now
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data?.map((blog, i) => (
          <Link key={blog._id} to={`/blog/${blog.slug}`}
            style={{ display: 'flex', gap: 14, padding: '12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.2s', alignItems: 'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.08)', minWidth: 28, lineHeight: 1.4, flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', lineHeight: 1.4, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {blog.title}
              </p>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiEye size={10} /> {blog.views || 0}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiHeart size={10} /> {blog.likes?.length || 0}</span>
              </div>
            </div>
          </Link>
        ))}
        {(!data || data.length === 0) && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', padding: '12px', textAlign: 'center' }}>
            No trending stories yet
          </p>
        )}
      </div>
    </div>
  )
}