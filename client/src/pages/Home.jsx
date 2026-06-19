import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'

const CATEGORIES = [
  { name: 'Technology',  emoji: '💻', var: '--cat-technology' },
  { name: 'Programming', emoji: '🧑‍💻', var: '--cat-programming' },
  { name: 'Design',      emoji: '🎨', var: '--cat-design' },
  { name: 'Business',    emoji: '💼', var: '--cat-business' },
  { name: 'Travel',      emoji: '✈️', var: '--cat-travel' },
]

const MARQUEE = [
  'Technology','Design','Programming','Science',
  'Business','Lifestyle','Travel','Health & Wellness'
]

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop',
]

export default function Home() {
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['featuredBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 6 })
      return res.data
    }
  })

  const blogs = blogsData?.blogs || []
  const total = blogsData?.pagination?.total || 0

  return (
    <div style={{ fontFamily: 'var(--font-ui)', background: 'var(--bg-page)', minHeight: '100vh', paddingTop: '64px' }}>
      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

        .home-hero {
          min-height: 90vh; display: flex; flex-direction: column;
          justify-content: center; padding: 80px 48px;
          position: relative; overflow: hidden;
          background: radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 60%);
        }
        .home-hero::before {
          content:''; position:absolute; inset:0;
          background-image: radial-gradient(color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent-soft); border: 1px solid var(--border-soft);
          border-radius: 100px; padding: 6px 14px; font-size: 12px;
          color: var(--accent-strong); margin-bottom: 28px; letter-spacing: 0.5px;
          width: fit-content; animation: fadeUp 0.6s ease both;
        }
        .hero-dot { width:6px;height:6px;background:var(--accent);border-radius:50%;animation:blink 2s ease-in-out infinite }
        .hero-h1 {
          font-family:var(--font-display); font-size:clamp(36px,6vw,72px);
          font-weight:700; line-height:1.05; letter-spacing:-1.5px;
          max-width:780px; margin-bottom:20px; color: var(--text-primary);
          animation:fadeUp 0.6s 0.1s ease both;
        }
        .hero-h1 .grad { color: var(--accent); }
        .hero-sub {
          font-size:17px; color:var(--text-secondary); line-height:1.7;
          max-width:480px; margin-bottom:40px; font-family: var(--font-body); font-weight:400;
          animation:fadeUp 0.6s 0.2s ease both;
        }
        .hero-actions {
          display:flex; align-items:center; gap:16px; margin-bottom:64px;
          animation:fadeUp 0.6s 0.3s ease both;
        }
        .btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          padding:14px 28px; background: var(--accent);
          color:var(--text-on-accent); border-radius:var(--radius-md); font-size:15px; font-weight:500;
          text-decoration:none; transition:all 0.25s; font-family: var(--font-ui);
          box-shadow:var(--shadow-pop);
        }
        .btn-primary:hover { transform:translateY(-2px); background: var(--accent-strong); }
        .btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          font-size:15px; color:var(--text-secondary); text-decoration:none; transition:color 0.2s;
          font-family: var(--font-ui);
        }
        .btn-secondary:hover { color:var(--text-primary); }
        .hero-stats {
          display:flex; gap:48px; padding-top:40px;
          border-top:1px solid var(--border-soft);
          animation:fadeUp 0.6s 0.4s ease both;
        }
        .stat-num {
          font-family:var(--font-display); font-size:32px; font-weight:700;
          color: var(--accent);
        }
        .stat-label { font-size:12px; color:var(--text-tertiary); margin-top:3px; letter-spacing:0.5px; }

        .hero-visual {
          position:absolute; right:60px; top:50%; transform:translateY(-50%);
          width:320px; height:320px; pointer-events:none;
        }
        .ring {
          position:absolute; inset:0; border-radius:50%;
          border:1px solid var(--border-strong); animation:spin 20s linear infinite;
        }
        .ring:nth-child(2) { inset:28px; animation-direction:reverse;animation-duration:15s }
        .ring:nth-child(3) { inset:56px; animation-duration:25s }
        .ring-center {
          position:absolute; inset:90px; border-radius:50%;
          background:radial-gradient(circle, color-mix(in srgb, var(--accent) 25%, transparent), transparent);
          display:flex; align-items:center; justify-content:center;
          font-size:52px; color: var(--accent);
          animation:float 6s ease-in-out infinite;
        }

        .marquee-bar {
          padding:14px 0; overflow:hidden;
          background: var(--bg-surface-2);
          border-top:1px solid var(--border-soft);
          border-bottom:1px solid var(--border-soft);
        }
        .marquee-track { display:flex; animation:marquee 28s linear infinite; white-space:nowrap; }
        .m-item {
          display:inline-flex; align-items:center; gap:28px; padding:0 28px;
          font-size:11px; color:var(--text-tertiary);
          letter-spacing:2px; text-transform:uppercase; flex-shrink:0;
        }
        .m-dot { width:3px;height:3px;background:var(--text-tertiary);border-radius:50%;flex-shrink:0 }

        .section { padding:80px 48px; }
        .section-dark { background: var(--bg-surface-2); }
        .section-tag {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; letter-spacing:2px; text-transform:uppercase;
          color:var(--accent); margin-bottom:12px;
        }
        .section-tag::before { content:''; width:16px;height:1px;background:var(--accent) }
        .section-title {
          font-family:var(--font-display); font-size:clamp(28px,4vw,40px);
          font-weight:700; letter-spacing:-0.5px; color:var(--text-primary); margin-bottom:6px;
        }
        .section-sub { font-size:14px; color:var(--text-tertiary); font-family: var(--font-body); }

        .featured-grid {
          display:grid; grid-template-columns:1.5fr 1fr;
          gap:2px; background:var(--border-soft);
          border-radius:var(--radius-lg); overflow:hidden; margin-top:40px;
        }
        .feat-main {
          position:relative; min-height:460px; cursor:pointer; overflow:hidden;
          background:var(--bg-surface); text-decoration:none; display:block;
        }
        .feat-main:hover .feat-img { transform:scale(1.04); }
        .feat-img {
          width:100%;height:100%;object-fit:cover;position:absolute;
          inset:0;transition:transform 0.6s ease;opacity:0.5;
        }
        .feat-overlay {
          position:absolute;inset:0;
          background:linear-gradient(to top, var(--bg-page) 0%, color-mix(in srgb, var(--bg-page) 40%, transparent) 60%,transparent 100%);
        }
        .feat-content { position:absolute;bottom:0;left:0;right:0;padding:32px; }
        .feat-cat {
          font-size:10px;letter-spacing:2px;text-transform:uppercase;
          color:var(--accent);margin-bottom:10px;display:flex;align-items:center;gap:6px;
        }
        .feat-cat::before { content:'';width:12px;height:1px;background:var(--accent) }
        .feat-title {
          font-family:var(--font-display);font-size:clamp(18px,2.5vw,26px);
          font-weight:700;line-height:1.25;letter-spacing:-0.3px;color:var(--text-primary);margin-bottom:12px;
        }
        .feat-meta { font-size:12px;color:var(--text-tertiary);display:flex;gap:10px; }
        .feat-sides { display:flex;flex-direction:column;gap:2px; }
        .feat-side {
          background:var(--bg-surface);padding:28px;cursor:pointer;
          transition:background 0.2s;flex:1;display:flex;
          flex-direction:column;justify-content:flex-end;
          text-decoration:none;
        }
        .feat-side:hover { background:var(--bg-surface-2); }
        .feat-side-cat { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:8px; }
        .feat-side-title {
          font-family:var(--font-display);font-size:16px;font-weight:700;
          line-height:1.3;letter-spacing:-0.2px;color:var(--text-primary);margin-bottom:8px;
        }
        .feat-side-meta { font-size:12px;color:var(--text-tertiary); }

        .cats-grid {
          display:grid;grid-template-columns:repeat(5,1fr);
          gap:2px;margin-top:40px;
          background:var(--border-soft);border-radius:var(--radius-lg);overflow:hidden;
        }
        .cat-card {
          padding:28px 20px;background:var(--bg-surface);cursor:pointer;
          transition:all 0.25s;position:relative;overflow:hidden;
          text-decoration:none;display:block;
          border-bottom:2px solid transparent;
        }
        .cat-card:hover { background:var(--bg-surface-2); }
        .cat-emoji { font-size:28px;margin-bottom:14px; }
        .cat-name { font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px; }
        .cat-count { font-size:11px;color:var(--text-tertiary); }

        .articles-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px; }
        .article-card {
          background:var(--bg-surface);border:1px solid var(--border-soft);
          border-radius:var(--radius-lg);overflow:hidden;cursor:pointer;
          transition:all 0.3s;text-decoration:none;display:flex;flex-direction:column;
          box-shadow: var(--shadow-card);
        }
        .article-card:hover {
          transform:translateY(-5px);border-color:var(--accent);
          box-shadow: var(--shadow-pop);
        }
        .article-card:hover .art-img { transform:scale(1.06); }
        .art-img-wrap { height:180px;overflow:hidden;background:var(--bg-surface-2); }
        .art-img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease; }
        .art-body { padding:20px;flex:1;display:flex;flex-direction:column; }
        .art-cat { font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px; }
        .art-title {
          font-family:var(--font-display);font-size:16px;font-weight:700;
          line-height:1.35;letter-spacing:-0.2px;color:var(--text-primary);margin-bottom:8px;
        }
        .art-excerpt { font-size:13px;color:var(--text-tertiary);line-height:1.6;margin-bottom:16px;font-family: var(--font-body);flex:1; }
        .art-footer {
          display:flex;align-items:center;justify-content:space-between;
          padding-top:12px;border-top:1px solid var(--border-soft);
        }
        .art-author { font-size:12px;color:var(--text-secondary); }
        .art-read { font-size:11px;color:var(--text-tertiary); }

        .nl-section { background: var(--accent-soft); }
        .nl-title {
          font-family:var(--font-display);font-size:clamp(28px,4vw,44px);
          font-weight:700;letter-spacing:-1px;color:var(--text-primary);margin-bottom:12px;
        }
        .nl-title .grad { color: var(--accent-strong); }
        .nl-sub { font-size:15px;color:var(--text-secondary);font-family: var(--font-body);margin-bottom:32px;line-height:1.6;max-width:480px; }
        .nl-form { display:flex;gap:10px;max-width:440px; }
        .nl-input {
          flex:1;padding:14px 18px;background:var(--bg-surface);
          border:1px solid var(--border-strong);border-radius:var(--radius-md);color:var(--text-primary);
          font-size:14px;font-family:var(--font-ui);outline:none;transition:border-color 0.2s;
        }
        .nl-input::placeholder { color:var(--text-tertiary); }
        .nl-input:focus { border-color:var(--accent); }
        .nl-btn {
          padding:14px 24px;background: var(--accent);
          color:var(--text-on-accent);border:none;border-radius:var(--radius-md);font-size:14px;font-weight:500;
          font-family:var(--font-ui);cursor:pointer;transition:all 0.25s;
          white-space:nowrap;
        }
        .nl-btn:hover { transform:translateY(-1px);background: var(--accent-strong); }

        .bs-footer {
          padding:32px 48px;background:var(--bg-surface-2);
          display:flex;align-items:center;justify-content:space-between;
          border-top:1px solid var(--border-soft);
          font-family:var(--font-ui);
        }
        .bs-footer-logo {
          font-family:var(--font-display);font-size:18px;font-weight:700;
          color: var(--accent);
          text-decoration:none;
        }
        .bs-footer-links { display:flex;gap:20px; }
        .bs-footer-link { font-size:13px;color:var(--text-tertiary);text-decoration:none;transition:color 0.2s; }
        .bs-footer-link:hover { color:var(--text-primary); }
        .bs-footer-copy { font-size:12px;color:var(--text-tertiary); }

        .skeleton { background:var(--bg-surface-2);border-radius:8px;animation:pulse 1.5s ease-in-out infinite; }

        @media(max-width:768px){
          .home-hero{padding:60px 20px}
          .hero-visual{display:none}
          .hero-stats{gap:24px}
          .featured-grid{grid-template-columns:1fr}
          .cats-grid{grid-template-columns:repeat(2,1fr)}
          .articles-grid{grid-template-columns:1fr}
          .section{padding:60px 20px}
          .nl-form{flex-direction:column}
          .bs-footer{flex-direction:column;gap:16px;text-align:center;padding:24px 20px}
          .bs-footer-links{flex-wrap:wrap;justify-content:center}
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="hero-visual">
          <div className="ring" />
          <div className="ring" />
          <div className="ring" />
          <div className="ring-center">✦</div>
        </div>

        <div className="hero-badge">
          <span className="hero-dot" />
          {total > 0 ? `${total} stories published — new daily` : 'Be the first to publish a story'}
        </div>

        <h1 className="hero-h1">
          Where great minds <span className="grad">share their stories</span>
        </h1>

        <p className="hero-sub">
          Discover ideas, essays, and perspectives from the world's best writers on technology, design, culture, and beyond.
        </p>

        <div className="hero-actions">
          <Link to="/blogs" className="btn-primary">
            Explore stories
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/register" className="btn-secondary">
            Start writing free →
          </Link>
        </div>

        <div className="hero-stats">
          <div>
            <div className="stat-num">{total}+</div>
            <div className="stat-label">Published stories</div>
          </div>
          <div>
            <div className="stat-num">100+</div>
            <div className="stat-label">Active writers</div>
          </div>
          <div>
            <div className="stat-num">10+</div>
            <div className="stat-label">Topics covered</div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="m-item">
              {item}
              <span className="m-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED ── */}
      <section className="section">
        <div className="section-tag">Editor's picks</div>
        <h2 className="section-title">Featured this week</h2>
        <p className="section-sub">Hand-picked stories from our editorial team</p>

        {isLoading ? (
          <div className="featured-grid">
            <div className="skeleton" style={{ minHeight: 460 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div className="skeleton" style={{ flex: 1, minHeight: 225 }} />
              <div className="skeleton" style={{ flex: 1, minHeight: 225 }} />
            </div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="featured-grid">
            <Link to={`/blog/${blogs[0]?.slug}`} className="feat-main">
              <img
                className="feat-img"
                src={blogs[0]?.image || FALLBACK_IMGS[0]}
                alt={blogs[0]?.title}
              />
              <div className="feat-overlay" />
              <div className="feat-content">
                <div className="feat-cat">{blogs[0]?.category}</div>
                <div className="feat-title">{blogs[0]?.title}</div>
                <div className="feat-meta">
                  <span>{blogs[0]?.author?.name}</span>
                  <span>·</span>
                  <span>{blogs[0]?.readTime || 5} min read</span>
                  <span>·</span>
                  <span>{blogs[0]?.views || 0} views</span>
                </div>
              </div>
            </Link>
            <div className="feat-sides">
              {blogs.slice(1, 3).map((blog) => (
                <Link key={blog._id} to={`/blog/${blog.slug}`} className="feat-side">
                  <div className="feat-side-cat">{blog.category}</div>
                  <div className="feat-side-title">{blog.title}</div>
                  <div className="feat-side-meta">{blog.author?.name} · {blog.readTime || 5} min read</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No stories yet</h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 24 }}>Be the first to publish something great.</p>
            <Link to="/admin/create" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              Write a story
            </Link>
          </div>
        )}
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section section-dark">
        <div className="section-tag">Explore topics</div>
        <h2 className="section-title">Find your passion</h2>
        <p className="section-sub">Browse stories by category</p>
        <div className="cats-grid">
          {CATEGORIES.map(({ name, emoji, var: colorVar }) => (
            <Link
              key={name}
              to={`/blogs?category=${name}`}
              className="cat-card"
              style={{ borderBottomColor: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderBottomColor = `var(${colorVar})`}
              onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              <div className="cat-emoji">{emoji}</div>
              <div className="cat-name">{name}</div>
              <div className="cat-count">Browse articles →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST ── */}
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div className="section-tag">Fresh reads</div>
            <h2 className="section-title">Latest articles</h2>
            <p className="section-sub">What's new on BlogSpace today</p>
          </div>
          <Link to="/blogs" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s', paddingBottom: 40 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="articles-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 360 }} />)}
          </div>
        ) : (
          <div className="articles-grid">
            {blogs.map((blog, i) => {
              const catMeta = CATEGORIES.find(c => c.name === blog.category)
              return (
                <Link key={blog._id} to={`/blog/${blog.slug}`} className="article-card">
                  <div className="art-img-wrap">
                    <img
                      className="art-img"
                      src={blog.image || FALLBACK_IMGS[i % FALLBACK_IMGS.length]}
                      alt={blog.title}
                    />
                  </div>
                  <div className="art-body">
                    <div className="art-cat" style={{ color: catMeta ? `var(${catMeta.var})` : 'var(--accent)' }}>
                      {blog.category}
                    </div>
                    <div className="art-title">{blog.title}</div>
                    <div className="art-excerpt">
                      {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                    </div>
                    <div className="art-footer">
                      <span className="art-author">{blog.author?.name}</span>
                      <span className="art-read">{blog.readTime || 5} min read</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="section nl-section">
        <div style={{ maxWidth: 600 }}>
          <div className="section-tag">Stay updated</div>
          <h2 className="nl-title">
            The best stories,<br />
            <span className="grad">delivered weekly</span>
          </h2>
          <p className="nl-sub">
            Join thousands of readers who get our hand-picked selection of the week's best writing every Sunday morning.
          </p>
          <div className="nl-form">
            <input className="nl-input" type="email" placeholder="your@email.com" />
            <button className="nl-btn">Subscribe</button>
          </div>
        </div>
      </section>

      
    </div>
  )
}
