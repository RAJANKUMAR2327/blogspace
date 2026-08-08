import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import { StaggerGrid, StaggerItem } from '../components/common/StaggerGrid'
import { motion } from 'framer-motion'
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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .sr-input {
          flex:1; padding:16px 16px 16px 48px;
          background:var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:12px; font-size:16px; color:#fff; outline:none;
          font-family:'Inter',sans-serif; transition:all 0.2s;
        }
        .sr-input:focus { border-color:rgba(167,139,250,0.4); background:rgba(167,139,250,0.04); }
        .sr-input::placeholder { color:var(--text-tertiary); }
        .sr-btn {
          padding:16px 28px; background:linear-gradient(135deg,#7c3aed,#2563eb);
          color:white; border:none; border-radius:12px; font-size:15px;
          font-weight:500; cursor:pointer; font-family:'Inter',sans-serif;
          transition:all 0.2s; white-space:nowrap;
        }
        .sr-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(124,58,237,0.4); }
        .skeleton { background:var(--bg-surface-2);border-radius:14px;animation:pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 'var(--text-xs)', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: 'rgba(167,139,250,0.4)', display: 'inline-block' }} />
            Search
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>
            {query ? `Results for "${query}"` : 'Search stories'}
          </h1>
          {query && !isLoading && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', fontWeight: 300 }}>
              Found {data?.blogs?.length || 0} stories
            </p>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 48 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 'var(--text-lg)' }} />
            <input className="sr-input" type="text" aria-label="Search stories" value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search stories, topics, authors..." />
          </div>
          <button type="submit" className="sr-btn">Search</button>
        </form>

        {/* States */}
        {!query && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16, filter: 'grayscale(0.3)' }}>🔍</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Start searching
            </h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-base)' }}>
              Type something to discover great stories
            </p>
          </div>
        )}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
          </motion.div>
        )}

        {query && !isLoading && data?.blogs?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              No results found
            </h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 24, fontSize: 'var(--text-base)' }}>
              No stories matched "{query}" — try different keywords
            </p>
            <Link to="/blogs" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Browse all stories →
            </Link>
          </div>
        )}

        {!isLoading && data?.blogs?.length > 0 && (
          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {data.blogs.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
          </StaggerGrid>
        )}
      </div>
    </div>
  )
}
