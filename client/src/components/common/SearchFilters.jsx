import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX } from 'react-icons/fi'

export default function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    sortBy:      searchParams.get('sortBy')      || 'latest',
    minReadTime: searchParams.get('minReadTime') || '',
    maxReadTime: searchParams.get('maxReadTime') || '',
    tag:         searchParams.get('tag')         || ''
  })

  const applyFilters = () => {
    const params = {}
    if (filters.sortBy && filters.sortBy !== 'latest') params.sortBy = filters.sortBy
    if (filters.minReadTime) params.minReadTime = filters.minReadTime
    if (filters.maxReadTime) params.maxReadTime = filters.maxReadTime
    if (filters.tag) params.tag = filters.tag
    if (searchParams.get('search'))   params.search   = searchParams.get('search')
    if (searchParams.get('category')) params.category = searchParams.get('category')
    setSearchParams(params)
    setOpen(false)
  }

  const clearFilters = () => {
    setFilters({ sortBy: 'latest', minReadTime: '', maxReadTime: '', tag: '' })
    const params = {}
    if (searchParams.get('search'))   params.search   = searchParams.get('search')
    if (searchParams.get('category')) params.category = searchParams.get('category')
    setSearchParams(params)
    setOpen(false)
  }

  const hasFilters = filters.minReadTime || filters.maxReadTime ||
    filters.tag || filters.sortBy !== 'latest'

  return (
    <div style={{ position: 'relative', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        .sf-input { padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:13px;color:#fff;outline:none;font-family:'Inter',sans-serif;width:100%;box-sizing:border-box;transition:border-color 0.2s; }
        .sf-input:focus { border-color:rgba(167,139,250,0.4); }
        .sf-input::placeholder { color:rgba(255,255,255,0.2); }
        .sf-select { padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:13px;color:#fff;outline:none;font-family:'Inter',sans-serif;width:100%;cursor:pointer;appearance:none; }
        .sf-select option { background:#0d0d1a; }
      `}</style>

      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px',
          background: hasFilters ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${hasFilters ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 10, color: hasFilters ? '#a78bfa' : 'rgba(255,255,255,0.5)',
          fontSize: 13, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s'
        }}>
        <FiFilter size={13} />
        Filters
        {hasFilters && <span style={{ width: 6, height: 6, background: '#a78bfa', borderRadius: '50%' }} />}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8,
          width: 280, background: '#0d0d1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: 20, zIndex: 100,
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Filter Stories</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 16, display: 'flex' }}>
              <FiX />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Sort */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Sort by</label>
              <select className="sf-select" value={filters.sortBy}
                onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))}>
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="popular">Most viewed</option>
                <option value="liked">Most liked</option>
              </select>
            </div>

            {/* Read time */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Read time (minutes)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="sf-input" type="number" placeholder="Min" min="1" max="60"
                  value={filters.minReadTime}
                  onChange={e => setFilters(p => ({ ...p, minReadTime: e.target.value }))} />
                <input className="sf-input" type="number" placeholder="Max" min="1" max="60"
                  value={filters.maxReadTime}
                  onChange={e => setFilters(p => ({ ...p, maxReadTime: e.target.value }))} />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tag</label>
              <input className="sf-input" type="text" placeholder="e.g. react, ai, design"
                value={filters.tag}
                onChange={e => setFilters(p => ({ ...p, tag: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={clearFilters}
                style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Clear
              </button>
              <button onClick={applyFilters}
                style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
