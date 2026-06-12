// ALL imports must be at the TOP of the file like this:
import SearchFilters from '../components/common/SearchFilters'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import { FiSearch, FiGrid, FiList } from 'react-icons/fi'

const CATEGORIES = ['All','Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']

const CAT_COLORS = {
  Technology:'#a78bfa', Programming:'#60a5fa', Design:'#34d399',
  Business:'#f472b6', Science:'#fb923c', Health:'#4ade80',
  Travel:'#facc15', Food:'#f87171', Lifestyle:'#c084fc', Other:'#94a3b8'
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
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .bl-search-input {
          flex:1; padding:13px 16px 13px 44px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; font-size:15px; color:#fff; outline:none;
          font-family:'Inter',sans-serif; transition:all 0.2s;
        }
        .bl-search-input:focus { border-color:rgba(167,139,250,0.4); background:rgba(167,139,250,0.04); }
        .bl-search-input::placeholder { color:rgba(255,255,255,0.2); }
        .bl-search-btn {
          padding:13px 24px; background:linear-gradient(135deg,#7c3aed,#2563eb);
          color:white; border:none; border-radius:10px; font-size:14px;
          font-weight:500; cursor:pointer; font-family:'Inter',sans-serif;
          transition:all 0.2s; white-space:nowrap;
        }
        .bl-search-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(124,58,237,0.4); }
        .cat-pill {
          padding:8px 16px; border-radius:100px; font-size:13px;
          font-weight:500; cursor:pointer; transition:all 0.2s;
          border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5);
          white-space:nowrap;
        }
        .cat-pill:hover { border-color:rgba(167,139,250,0.3); color:rgba(255,255,255,0.8); }
        .cat-pill.active {
          background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(37,99,235,0.3));
          border-color:rgba(124,58,237,0.4); color:#fff;
        }
        .page-btn {
          padding:8px 16px; border-radius:8px; font-size:13px; cursor:pointer;
          transition:all 0.2s; border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5);
          font-family:'Inter',sans-serif;
        }
        .page-btn:hover:not(:disabled) { border-color:rgba(167,139,250,0.3); color:#fff; }
        .page-btn.active { background:linear-gradient(135deg,#7c3aed,#2563eb); border-color:transparent; color:#fff; }
        .page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:14px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ padding: '60px 48px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '200px', background: 'radial-gradient(ellipse,rgba(124,58,237,0.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 12 }}>
            <span style={{ width: 16, height: 1, background: 'rgba(167,139,250,0.4)', display: 'inline-block' }} />
            Explore
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
            All Stories
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginBottom: 40 }}>
            {data?.pagination?.total || 0} articles across {CATEGORIES.length - 1} topics
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 560, marginBottom: 32 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 16 }} />
              <input className="bl-search-input" type="text" value={search}
                onChange={(e) => setSearch(e.target.value)} placeholder="Search articles, topics, authors..." />
            </div>
            <button type="submit" className="bl-search-btn">Search</button>
          </form>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ padding: '0 48px 32px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              className={`cat-pill ${(category === cat || (cat === 'All' && !category)) ? 'active' : ''}`}
              style={cat !== 'All' && CAT_COLORS[cat] && (category === cat) ? {
                borderColor: CAT_COLORS[cat] + '60',
                background: CAT_COLORS[cat] + '15',
                color: CAT_COLORS[cat]
              } : {}}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div style={{ padding: '0 48px 80px' }}>
        
        {/* Unified Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              {isLoading ? 'Loading...' : `${data?.blogs?.length || 0} of ${data?.pagination?.total || 0} stories`}
            </p>
            <SearchFilters />
          </div>
          
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setView('grid')} style={{ padding: '7px 10px', background: view === 'grid' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)', border: '1px solid', borderColor: view === 'grid' ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)', borderRadius: 8, color: view === 'grid' ? '#a78bfa' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center' }}>
              <FiGrid />
            </button>
            <button onClick={() => setView('list')} style={{ padding: '7px 10px', background: view === 'list' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)', border: '1px solid', borderColor: view === 'list' ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)', borderRadius: 8, color: view === 'list' ? '#a78bfa' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center' }}>
              <FiList />
            </button>
          </div>
        </div>

        {/* Grid/Layout Content */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
          </div>
        ) : data?.blogs?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No stories found</h3>
            <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Try different keywords or browse all categories</p>
            <button onClick={() => { setSearch(''); setSearchParams({}) }}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(3,1fr)' : '1fr', gap: 20 }}>
            {data.blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
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