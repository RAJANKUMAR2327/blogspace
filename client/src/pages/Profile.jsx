import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { userAPI, uploadAPI, authAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import { StaggerGrid, StaggerItem } from '../components/common/StaggerGrid'
import EmptyState from '../components/common/EmptyState'
import { AnimatePresence, motion } from 'framer-motion'
import TwoFactorSettings from '../components/profile/TwoFactorSettings'
import toast from 'react-hot-toast'
import { FiClock } from 'react-icons/fi'
import {
  FiEdit2, FiSave, FiX, FiBookmark, FiHeart,
  FiUsers, FiFileText, FiCamera, FiUser, FiMail,
  FiCalendar, FiShield, FiAlertCircle
} from 'react-icons/fi'

const TABS = [
  { id: 'saved',     label: 'Saved',     icon: FiBookmark },
  { id: 'history',   label: 'History',   icon: FiClock },
  { id: 'following', label: 'Following', icon: FiUsers },
  { id: 'settings',  label: 'Settings',  icon: FiEdit2 },
]

export default function Profile() {
  const { user, login } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('saved')
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Helper to generate the initial form state structure safely
  const getInitialFormData = () => ({
    name: user?.name || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    socialLinks: {
      twitter:  user?.socialLinks?.twitter  || '',
      github:   user?.socialLinks?.github   || '',
      linkedin: user?.socialLinks?.linkedin || '',
      website:  user?.socialLinks?.website  || '',
    }
  })

  const [formData, setFormData] = useState(getInitialFormData())

  // Saved blogs
  const { data: savedBlogs, isLoading: savedLoading } = useQuery({
    queryKey: ['savedBlogs'],
    queryFn: async () => {
      const res = await userAPI.getSaved()
      return res.data.blogs
    }
  })

  // Following list
  const { data: followingData } = useQuery({
    queryKey: ['followingList'],
    queryFn: async () => {
      const res = await userAPI.getProfile()
      return res.data.user
    }
  })

  // Recent Login Activity Query
  const { data: loginActivity } = useQuery({
    queryKey: ['loginActivity'],
    queryFn: async () => {
      const res = await userAPI.getLoginActivity()
      return res.data.activity
    },
    enabled: activeTab === 'settings'
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (res) => {
      const token = localStorage.getItem('token')
      login(res.data.user, token)
      queryClient.invalidateQueries(['profile'])
      setEditing(false)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Update failed')
  })

  // Avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) return toast.error('Image must be under 3MB')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.profileImage(fd)
      setFormData(p => ({ ...p, profileImage: res.data.url }))
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['readingHistory'],
    queryFn: async () => {
      const res = await userAPI.getHistory()
      return res.data.history
    },
    enabled: activeTab === 'history'
  })

  // Send Email Verification mutation
  const sendVerificationMutation = useMutation({
    mutationFn: () => authAPI.sendVerification(),
    onSuccess: () => toast.success('Verification email sent! Check your inbox.'),
    onError: () => toast.error('Failed to send verification email')
  })

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        .profile-input {
          width:100%; padding:12px 16px;
          background:var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:10px; font-size:15px; color:#fff; outline:none;
          font-family:'Inter',sans-serif; transition:all 0.2s; box-sizing:border-box;
        }
        .profile-input:focus { border-color:rgba(167,139,250,0.4); background:rgba(167,139,250,0.03); }
        .profile-input::placeholder { color:var(--text-tertiary); }
        .tab-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 18px; border-radius:10px; font-size:14px; font-weight:500;
          cursor:pointer; transition:all 0.2s; border:none; font-family:'Inter',sans-serif;
          background:transparent; color:var(--text-tertiary);
        }
        .tab-btn:hover { color:var(--text-secondary); }
        .tab-btn.active {
          background:rgba(124,58,237,0.15);
          border:1px solid rgba(124,58,237,0.25);
          color:#a78bfa;
        }
        .save-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 24px; background:linear-gradient(135deg,#7c3aed,#2563eb);
          color:white; border:none; border-radius:10px; font-size:14px;
          font-weight:500; cursor:pointer; font-family:'Inter',sans-serif;
          transition:all 0.2s; box-shadow:0 6px 20px rgba(124,58,237,0.3);
        }
        .save-btn:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(124,58,237,0.5); }
        .save-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .cancel-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 20px; background:var(--bg-surface-2);
          border:1px solid var(--border-soft); color:var(--text-secondary);
          border-radius:10px; font-size:14px; font-weight:500;
          cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s;
        }
        .cancel-btn:hover { border-color:var(--border-strong); color:#fff; }
        .stat-card {
          background:var(--bg-surface); border:1px solid var(--border-soft);
          border-radius:12px; padding:16px 20px; text-align:center;
          transition:border-color 0.2s;
        }
        .stat-card:hover { border-color:rgba(167,139,250,0.2); }
        .skeleton { background:var(--bg-surface-2);border-radius:14px;animation:pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Profile Header */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ height: 200, background: 'linear-gradient(135deg,rgba(124,58,237,0.28),rgba(37,99,235,0.18),rgba(52,211,153,0.12))', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(color-mix(in srgb, var(--text-primary) 5%, transparent) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', top: -60, left: '15%', width: 320, height: 320, background: 'radial-gradient(ellipse, rgba(124,58,237,0.35), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, right: '10%', width: 280, height: 280, background: 'radial-gradient(ellipse, rgba(52,211,153,0.25), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg-page) 100%)' }} />
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -60, marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid var(--bg-page)', overflow: 'hidden', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 28px rgba(124,58,237,0.35)' }}>
                {formData.profileImage || user?.profileImage ? (
                  <img src={formData.profileImage || user?.profileImage} alt={user?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {editing && (
                <label style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-page)' }}>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  <FiCamera size={13} style={{ color: 'var(--text-primary)' }} />
                </label>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
              {user?.role === 'admin' && (
                <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 10, color: '#a78bfa', textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 500, transition: 'all 0.2s' }}>
                  <FiShield size={14} /> Admin Panel
                </Link>
              )}
              {!editing ? (
                <button onClick={() => { setEditing(true); setFormData(getInitialFormData()); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--border-soft)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>
                  <FiEdit2 size={13} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(false)} className="cancel-btn"><FiX size={14} /> Cancel</button>
                  <button onClick={() => updateMutation.mutate(formData)} className="save-btn" disabled={updateMutation.isPending}>
                    <FiSave size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div style={{ marginBottom: 28, animation: 'fadeUp 0.6s ease both' }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
                <input className="profile-input" type="text" value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name" style={{ fontSize: 'var(--text-xl)', fontFamily: "'Syne',sans-serif", fontWeight: 700 }} />
                <textarea className="profile-input" value={formData.bio}
                  onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell the world about yourself..."
                  rows={3} style={{ resize: 'none' }} maxLength={200} />
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                  {formData.bio.length}/200
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    {user?.name}
                  </h1>
                  {user?.role === 'admin' && (
                    <span style={{ fontSize: 'var(--text-xs)', padding: '3px 10px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 100, color: '#a78bfa', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin</span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 300, maxWidth: 480, lineHeight: 1.6 }}>
                  {user?.bio || 'No bio yet — click Edit Profile to add one.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiMail size={13} /> {user?.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCalendar size={13} /> Joined {joinDate}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Saved', value: savedBlogs?.length || 0, icon: FiBookmark, color: '#a78bfa' },
              { label: 'Following', value: followingData?.following?.length || 0, icon: FiUsers, color: '#60a5fa' },
              { label: 'Followers', value: followingData?.followers?.length || 0, icon: FiHeart, color: '#f472b6' },
              { label: 'Role', value: user?.role === 'admin' ? 'Admin' : 'Member', icon: FiUser, color: '#34d399' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <Icon size={18} style={{ color, marginBottom: 8 }} />
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Verification Banner */}
          {!user?.isVerified && (
            <div style={{
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiAlertCircle size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Your email isn't verified yet. Verify it to unlock all features.
                </p>
              </div>
              <button
                onClick={() => sendVerificationMutation.mutate()}
                disabled={sendVerificationMutation.isPending}
                style={{
                  padding: '8px 18px', background: 'rgba(251,191,36,0.15)',
                  border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8,
                  color: '#fbbf24', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap'
                }}>
                <FiMail size={13} style={{ display: 'inline', marginRight: 6 }} />
                {sendVerificationMutation.isPending ? 'Sending...' : 'Send verification email'}
              </button>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-soft)', marginBottom: 32 }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`tab-btn ${activeTab === id ? 'active' : ''}`}>
                <Icon size={14} /> {label}
                {id === 'saved' && savedBlogs?.length > 0 && (
                  <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', background: 'rgba(167,139,250,0.2)', borderRadius: 100, color: '#a78bfa' }}>
                    {savedBlogs.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px 80px' }}>

        {/* Saved Articles */}
        {activeTab === 'saved' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Saved Articles
              </h2>
              {savedBlogs?.length > 0 && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{savedBlogs.length} saved</span>
              )}
            </div>

            <AnimatePresence mode="wait">
            {savedLoading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 360 }} />)}
              </motion.div>
            ) : savedBlogs?.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <EmptyState
                illustration="bookmark"
                title="No saved articles yet"
                description="Save articles you want to read later by clicking the bookmark icon"
                action={
                  <Link to="/blogs" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                    Browse stories →
                  </Link>
                }
              />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {savedBlogs.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
              </StaggerGrid>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        {/* Reading History */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Reading History
              </h2>
              {history?.length > 0 && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{history.length} articles</span>
              )}
            </div>

            <AnimatePresence mode="wait">
            {historyLoading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 360 }} />)}
              </motion.div>
            ) : history?.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 16 }}>📖</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  No reading history yet
                </h3>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: 24, fontSize: 'var(--text-base)' }}>
                  Articles you read will show up here
                </p>
                <Link to="/blogs" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Start reading →
                </Link>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {history?.map(blog => <StaggerItem key={blog._id}><BlogCard blog={blog} /></StaggerItem>)}
              </StaggerGrid>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        {/* Following */}
        {activeTab === 'following' && (
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
              Following
            </h2>
            {!followingData?.following?.length ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 16 }}>👥</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Not following anyone yet
                </h3>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: 24, fontSize: 'var(--text-base)' }}>
                  Follow writers you love to see their stories in your feed
                </p>
                <Link to="/blogs" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Discover writers →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                {followingData.following.map(writer => (
                  <div key={writer._id || writer} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-md)', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {writer.name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{writer.name || 'Unknown'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{writer.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
              Account Settings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile Info */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiUser size={15} style={{ color: '#a78bfa' }} /> Profile Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label htmlFor="profile-name" style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>Display Name</label>
                    <input id="profile-name" className="profile-input" type="text" value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="profile-bio" style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>Bio</label>
                    <textarea id="profile-bio" className="profile-input" value={formData.bio}
                      onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell the world about yourself..."
                      rows={3} style={{ resize: 'none' }} maxLength={200} />
                  </div>
                  
                  {/* Social Links Block */}
                  <div>
                    <label id="profile-social-links-label" style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>
                      Social Links
                    </label>
                    <div role="group" aria-labelledby="profile-social-links-label" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['twitter', 'github', 'linkedin', 'website'].map(platform => (
                        <input
                          key={platform}
                          className="profile-input"
                          type="url"
                          aria-label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                          placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                          value={formData.socialLinks[platform]}
                          onChange={(e) => setFormData(p => ({
                            ...p,
                            socialLinks: { ...p.socialLinks, [platform]: e.target.value }
                          }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-image-url" style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>Profile Image URL</label>
                    <input id="profile-image-url" className="profile-input" type="url" value={formData.profileImage}
                      onChange={(e) => setFormData(p => ({ ...p, profileImage: e.target.value }))}
                      placeholder="https://..." />
                  </div>
                  <button onClick={() => updateMutation.mutate(formData)} className="save-btn"
                    disabled={updateMutation.isPending} style={{ width: 'fit-content' }}>
                    <FiSave size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMail size={15} style={{ color: '#60a5fa' }} /> Account Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Role', value: user?.role === 'admin' ? '👑 Admin' : '👤 Member' },
                    { label: 'Member since', value: joinDate },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-surface-2)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{label}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <TwoFactorSettings />

              {/* Recent Login Activity */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Login Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loginActivity?.slice(0, 5).map(log => (
                    <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bg-surface-2)' }}>
                      <span style={{ fontSize: 12, color: log.success ? 'var(--text-secondary)' : '#f87171' }}>
                        {log.success ? '✓ Successful login' : `✗ Failed (${log.reason})`}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!loginActivity || loginActivity.length === 0) && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No login activity recorded yet</p>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#f87171', marginBottom: 8 }}>Danger Zone</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button style={{ padding: '10px 20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, color: '#f87171', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}
                  onClick={() => toast.error('Contact admin to delete your account')}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}