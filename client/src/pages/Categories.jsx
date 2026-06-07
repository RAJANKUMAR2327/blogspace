import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogAPI } from '../services/api'

const CATEGORIES = [
  { name:'Technology',  emoji:'💻', color:'#a78bfa', desc:'AI, gadgets, software & the future of tech' },
  { name:'Programming', emoji:'🧑‍💻', color:'#60a5fa', desc:'Code, tutorials, tools & developer insights' },
  { name:'Design',      emoji:'🎨', color:'#34d399', desc:'UI/UX, branding, graphics & visual arts' },
  { name:'Business',    emoji:'💼', color:'#f472b6', desc:'Startups, strategy, finance & entrepreneurship' },
  { name:'Science',     emoji:'🔬', color:'#fb923c', desc:'Research, discoveries & scientific breakthroughs' },
  { name:'Health',      emoji:'🏥', color:'#4ade80', desc:'Wellness, fitness, nutrition & mental health' },
  { name:'Travel',      emoji:'✈️', color:'#facc15', desc:'Adventures, destinations, tips & culture' },
  { name:'Food',        emoji:'🍳', color:'#f87171', desc:'Recipes, restaurants, cuisines & food culture' },
  { name:'Lifestyle',   emoji:'🌟', color:'#c084fc', desc:'Fashion, home, habits & personal growth' },
  { name:'Other',       emoji:'📌', color:'#94a3b8', desc:'Everything else worth reading and sharing' },
]

export default function Categories() {
  const { data } = useQuery({
    queryKey: ['allBlogsForCats'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 200 })
      return res.data.blogs
    }
  })

  const countMap = {}
  data?.forEach(b => { countMap[b.category] = (countMap[b.category] || 0) + 1 })

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .cat-grid-card {
          background:#0d0d1a; border:1px solid rgba(255,255,255,0.06);
          border-radius:16px; padding:28px; cursor:pointer;
          transition:all 0.3s; text-decoration:none; display:block;
          position:relative; overflow:hidden;
        }
        .cat-grid-card::before {
          content:''; position:absolute; inset:0; opacity:0;
          transition:opacity 0.3s;
        }
        .cat-grid-card:hover { transform:translateY(-4px); }
        .cat-grid-card:hover::before { opacity:1; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '60px 48px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '200px', background: 'radial-gradient(ellipse,rgba(124,58,237,0.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 12 }}>
            <span style={{ width: 16, height: 1, background: 'rgba(167,139,250,0.4)', display: 'inline-block' }} />
            Browse
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
            All Topics
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
            Find stories on topics that spark your curiosity
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ padding: '0 48px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {CATEGORIES.map(({ name, emoji, color, desc }, i) => (
          <Link key={name} to={`/blogs?category=${name}`} className="cat-grid-card"
            style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeUp 0.5s ease both' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = color + '40'
              e.currentTarget.style.boxShadow = `0 16px 40px ${color}15`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
            {/* Glow bg */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 20%, ${color}08, transparent 60%)`, borderRadius: 16 }} />

            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{emoji}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>{name}</h3>
                <span style={{ fontSize: 12, color, background: color + '15', border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: 100 }}>
                  {countMap[name] || 0} stories
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, fontWeight: 300, marginBottom: 16 }}>{desc}</p>
              <div style={{ fontSize: 13, color, display: 'flex', alignItems: 'center', gap: 4 }}>
                Browse stories →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
