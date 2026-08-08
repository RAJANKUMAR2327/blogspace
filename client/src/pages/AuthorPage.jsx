import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../services/api'
import { FiFileText, FiEye, FiUsers, FiUserCheck } from 'react-icons/fi'
import FollowButton from '../components/common/FollowButton'
import BlogCard from '../components/blog/BlogCard'
import { StaggerGrid, StaggerItem } from '../components/common/StaggerGrid'

export default function AuthorPage() {
  const { id } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: async () => {
      const res = await userAPI.getPublicProfile(id)
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 120, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading profile…</p>
      </div>
    )
  }

  if (isError || !data?.user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 120, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 40, marginBottom: 12 }}>🔍</p>
        <p style={{ color: 'var(--text-secondary)' }}>Author not found</p>
        <Link to="/" style={{ color: 'var(--accent)', fontSize: 14 }}>Back to home</Link>
      </div>
    )
  }

  const { user, blogs, stats, isFollowing } = data

  const STAT_ITEMS = [
    { icon: FiFileText,  label: 'Articles',  value: stats.articleCount },
    { icon: FiEye,       label: 'Views',     value: stats.totalViews },
    { icon: FiUsers,     label: 'Followers', value: stats.followersCount },
    { icon: FiUserCheck, label: 'Following', value: stats.followingCount },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        .author-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .author-blogs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        @media (max-width: 640px) {
          .author-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32,
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)', padding: 28, flexWrap: 'wrap'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: user.profileImage ? 'transparent' : 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: 'var(--text-on-accent)', overflow: 'hidden'
          }}>
            {user.profileImage
              ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user.name?.[0]?.toUpperCase()
            }
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name}
            </h1>
            {user.bio && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{user.bio}</p>}
          </div>
          <FollowButton userId={user._id} isFollowing={isFollowing} />
        </div>

        {/* Stats */}
        <div className="author-stats-grid" style={{ marginBottom: 40 }}>
          {STAT_ITEMS.map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'center'
            }}>
              <Icon size={16} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value.toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Blogs */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          Published Articles
        </h2>
        {blogs.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
            No published articles yet.
          </p>
        ) : (
          <StaggerGrid className="author-blogs-grid">
            {blogs.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
          </StaggerGrid>
        )}
      </div>
    </div>
  )
}
