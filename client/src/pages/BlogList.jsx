import { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { blogAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import SEO from '../components/common/SEO'
import EmptyState from '../components/common/EmptyState'
import Breadcrumbs from '../components/common/Breadcrumbs'
import Reveal from '../components/common/Reveal'
import { StaggerGrid, StaggerItem } from '../components/common/StaggerGrid'
import { AnimatePresence, motion } from 'framer-motion'
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
  const category = searchParams.get('category') || ''

  // useInfiniteQuery hook setup
  const {
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['blogsInfinite', category, search, searchParams.toString()],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 9 }
      if (category) params.category = category
      if (search)   params.search   = search
      if (searchParams.get('sortBy'))      params.sortBy      = searchParams.get('sortBy')
      if (searchParams.get('minReadTime')) params.minReadTime = searchParams.get('minReadTime')
      if (searchParams.get('maxReadTime')) params.maxReadTime = searchParams.get('maxReadTime')
      if (searchParams.get('tag'))         params.tag         = searchParams.get('tag')
      const res = await blogAPI.getAll(params)
      return res.data
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined
    },
    initialPageParam: 1
  })

  // Flatten infinite query pages into a cohesive array
  const allBlogs = data?.pages.flatMap(page => page.blogs) || []
  const totalCount = data?.pages[0]?.pagination?.total || 0

  // Infinite Scroll Sentinel Hook
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
    rootMargin: '300px 0px'
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ search, page: 1 })
  }

  const handleCategory = (cat) => {
    setSearchParams({ category: cat === 'All' ? '' : cat, page: 1 })
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
        .skeleton {
          background:linear-gradient(90deg, var(--bg-surface-2) 25%, var(--bg-surface) 50%, var(--bg-surface-2) 75%);
          background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:var(--radius-lg);
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg) } }

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
        <Reveal style={{ position: 'relative' }}>
          <Breadcrumbs items={category ? [
            { label: 'Stories', to: '/blogs' },
            { label: category }
          ] : [{ label: 'Stories' }]} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
            Explore
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>
            All Stories
          </h1>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginBottom: 40 }}>
            {totalCount} articles across {CATEGORIES.length - 1} topics
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="bl-search-form">
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 'var(--text-md)' }} />
              <input className="bl-search-input" type="text" aria-label="Search stories" value={search}
                onChange={(e) => setSearch(e.target.value)} placeholder="Search articles, topics, authors..." />
            </div>
            <button type="submit" className="bl-search-btn">Search</button>
          </form>
        </Reveal>
      </div>

      {/* Category Filter */}
      <div className="bl-cat-pad" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat || (cat === 'All' && !category)
            return (
              <motion.button
                key={cat}
                onClick={() => handleCategory(cat)}
                whileTap={{ scale: 0.94 }}
                className={`cat-pill ${isActive ? 'active' : ''}`}
                style={{
                  position: 'relative', overflow: 'hidden',
                  color: isActive && cat !== 'All' && CAT_VAR[cat] ? `var(${CAT_VAR[cat]})` : undefined
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCatPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 'inherit',
                      background: cat !== 'All' && CAT_VAR[cat]
                        ? `color-mix(in srgb, var(${CAT_VAR[cat]}) 15%, transparent)`
                        : 'var(--bg-surface-2)',
                      border: `1px solid ${cat !== 'All' && CAT_VAR[cat] ? `var(${CAT_VAR[cat]})` : 'var(--border-strong)'}`,
                      zIndex: 0
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{cat}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="bl-results-pad">
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {isLoading ? 'Loading...' : `${allBlogs.length} of ${totalCount} stories`}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setView('grid')} style={{ padding: '7px 10px', background: view === 'grid' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', border: '1px solid', borderColor: view === 'grid' ? 'var(--accent)' : 'var(--border-soft)', borderRadius: 8, color: view === 'grid' ? 'var(--accent-strong)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: 'var(--text-md)', display: 'flex', alignItems: 'center' }}>
              <FiGrid />
            </button>
            <button onClick={() => setView('list')} style={{ padding: '7px 10px', background: view === 'list' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', border: '1px solid', borderColor: view === 'list' ? 'var(--accent)' : 'var(--border-soft)', borderRadius: 8, color: view === 'list' ? 'var(--accent-strong)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: 'var(--text-md)', display: 'flex', alignItems: 'center' }}>
              <FiList />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="bl-grid" style={{ gridTemplateColumns: view === 'grid' ? undefined : '1fr' }}>
            {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
          </motion.div>
        ) : allBlogs.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <EmptyState
            illustration="noResults"
            title="No stories found"
            description="Try different keywords or browse all categories"
            action={
              <button onClick={() => { setSearch(''); setSearchParams({}) }}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: "'Inter',sans-serif" }}>
                Clear filters
              </button>
            }
          />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <StaggerGrid className={`bl-grid ${view === 'list' ? 'list-view' : ''}`}>
              {allBlogs.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} view={view} /></StaggerItem>)}
            </StaggerGrid>

            {/* Sentinel element + loading indicator */}
            <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              {isFetchingNextPage && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-soft)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              )}
              {!hasNextPage && allBlogs.length > 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', opacity: 0.7 }}>You've reached the end — {totalCount} stories total</p>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}