import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../../services/api'
import BlogCard from './BlogCard'
import { StaggerGrid, StaggerItem } from '../common/StaggerGrid'

export default function RelatedArticles({ blogId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['relatedBlogs', blogId],
    queryFn: async () => {
      const res = await blogAPI.getRelated(blogId)
      return res.data.blogs || res.data
    },
    enabled: !!blogId
  })

  if (!isLoading && (!data || data.length === 0)) return null

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
        You might also like
      </h2>
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 280, borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-2)' }} />
          ))}
        </div>
      ) : (
        <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {data.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
        </StaggerGrid>
      )}
    </div>
  )
}
