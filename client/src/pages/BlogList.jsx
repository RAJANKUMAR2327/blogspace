import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import SEO from '../components/common/SEO'
import { FiSearch, FiGrid, FiList } from 'react-icons/fi'

const CATEGORIES = ['All', 'Technology', 'Programming', 'Design', 'Business', 'Science', 'Health', 'Travel', 'Food', 'Lifestyle', 'Other']

const CAT_VAR = {
  Technology: '--cat-technology', Programming: '--cat-programming', Design: '--cat-design',
  Business: '--cat-business', Science: '--cat-science', Health: '--cat-health',
  Travel: '--cat-travel', Food: '--cat-food', Lifestyle: '--cat-lifestyle', Other: '--cat-other'
}

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [view, setView] = useState('grid')
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page, category, search],
    queryFn: async () => {
      const res = await blogAPI.getAll({ page, limit: 9, ...(category && { category }), ...(search && { search }) })
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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <SEO title="All Stories" description="Browse all published articles on BlogSpace." />
      
      <style>{`
        .bl-search-input {
          flex:1; padding:13px 16px 13px 44px;
          background: var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:var(--radius-md); font-size:15px; color:var(--text-primary); outline:none;
          font-family:var(--font-ui); transition:all 0.2s;
        }
        .bl-search-input:focus { border-color: var(--accent); }
        .bl-search-input::placeholder { color:var(--text-tertiary); }
        .bl-search-btn {
          padding:13px 24px; background: var(--accent);
          color:var(--text-on-accent); border:none; border-radius:var(--radius-md); font-size:14px;
          font-weight:500; cursor:pointer; font-family:var(--font-ui);
          transition:all 0.2s; white-space:nowrap;
        }
        .bl-search-btn:hover { transform:translateY(-1px); background: var(--accent-strong); }
        .cat-pill {
          padding:8px 16px; border-radius:100px; font-size:13px;
          font-weight:500; cursor:pointer; transition:all 0.2s;
          border:1px solid var(--border-soft);
          background:var(--bg-surface-2); color:var(--text-tertiary);
          white-space:nowrap;
        }
        .cat-pill:hover { border-color: var(--accent); color: var(--text-primary); }
        .cat-pill.active {
          background: var(--accent-soft);
          border-color: var(--accent); color: var(--accent-strong);
        }
        .page-btn {
          padding:8px 16px; border-radius:var(--radius-sm); font-size:13px; cursor:pointer;
          transition:all 0.2s; border:1px solid var(--border-soft);
          background:var(--bg-surface-2); color:var(--text-tertiary);
          font-family:var(--font-ui);
        }
        .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--text-primary); }
        .page-btn.active { background: var(--accent); border-color: transparent; color: var(--text-on-accent); }
        .page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .skeleton {
          background:linear-gradient(90deg, var(--bg-surface-2) 25%, var(--bg-surface) 50%, var(--bg-surface-2) 75%);
          background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:var(--radius-lg);
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .bl-header-pad { padding: 60px 48px 0; }
        .bl-cat-pad { padding: 0 48px 32px; }
        .bl-results-pad { padding: 0 48px 80px; }
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .bl-grid.list-view { grid-template-columns: 1fr; }
        .bl-search-form { display: flex; gap: 10px; max-width: 560px; margin-bottom: 32px; }
        @media (max-width: 900px) {
          .bl-header-pad, .bl-cat-pad, .bl-results-pad { padding-left: 24px !important; padding-right: 24px !important; }
          .bl-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .bl-grid { grid-template-columns: 1fr !important; }
          .bl-search-form { flex-direction: column; }
        }
      `}</style>

      {/* Header */}
      <div className="bl-header-pad" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '200px', background: 'radial-gradient(ellipse, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
            Explore
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>
            All Stories
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginBottom: 40 }}>
            {data?.pagination?.total || 0} articles across {CATEGORIES.length - 1} topics
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="bl-search-form">
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 16 }} />
              <input className="bl-search-input" type="text" value={search}
                onChange={(e) => setSearch(e.target.value)} placeholder="Search articles, topics, authors..." />
            </div>
            <button type="submit" className="bl-search-btn">Search</button>
          </form>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bl-cat-pad" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              className={`cat-pill ${(category === cat || (cat === 'All' && !category)) ? 'active' : ''}`}
              style={cat !== 'All' && CAT_VAR[cat] && (category === cat) ? {
                borderColor: `var(${CAT_VAR[cat]})`,
                background: `color-mix(in srgb, var(${CAT_VAR[cat]}) 15%, transparent)`,
                color: `var(${CAT_VAR[cat]})`
              } : {}}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bl-results-pad">
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {isLoading ? 'Loading...' : `${data?.blogs?.length || 0} of ${data?.pagination?.total || 0} stories`}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setView('grid')} style={{ padding: '7px 10px', background: view === 'grid' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', border: '1px solid', borderColor: view === 'grid' ? 'var(--accent)' : 'var(--border-soft)', borderRadius: 8, color: view === 'grid' ? 'var(--accent-strong)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center' }}>
              <FiGrid />
            </button>
            <button onClick={() => setView('list')} style={{ padding: '7px 10px', background: view === 'list' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', border: '1px solid', borderColor: view === 'list' ? 'var(--accent)' : 'var(--border-soft)', borderRadius: 8, color: view === 'list' ? 'var(--accent-strong)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center' }}>
              <FiList />
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="bl-grid">
            {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
          </div>
        ) : data?.blogs?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No stories found</h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 24 }}>Try different keywords or browse all categories</p>
            <button onClick={() => { setSearch(''); setSearchParams({}) }}
              style={{ padding: '10px 24px', background: 'var(--accent)', color: 'var(--text-on-accent)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className={`bl-grid ${view === 'list' ? 'list-view' : ''}`}>
            {data.blogs.map(blog => <BlogCard key={blog._id} blog={blog} view={view} />)}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48, flexWrap: 'wrap' }}>
            <button className="page-btn" onClick={() => handlePage(page - 1)} disabled={page === 1}>← Prev</button>
            {[...Array(data.pagination.pages)].map((_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => handlePage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => handlePage(page + 1)} disabled={page === data.pagination.pages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}