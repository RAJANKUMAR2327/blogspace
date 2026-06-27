import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
})

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register:           (data)  => API.post('/auth/register', data),
  login:              (data)  => API.post('/auth/login', data),
  getMe:              ()      => API.get('/auth/me'),
  forgotPassword:     (email) => API.post('/auth/forgot-password', { email }),
  resetPassword:      (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  sendVerification:   ()      => API.post('/auth/send-verification'),
}

// ── Blogs ─────────────────────────────────────────────
export const blogAPI = {
  getAll:         (params) => API.get('/blogs', { params }),
  getBySlug:      (slug)   => API.get(`/blogs/${slug}`),
  getTrending:    ()       => API.get('/blogs/trending'),
  getFeatured:    ()       => API.get('/blogs/featured'),
  getRecommended: ()       => API.get('/blogs/recommended'),
  getRelated:     (id)     => API.get(`/blogs/${id}/related`),
  getTrash:       ()       => API.get('/blogs/trash'),
  create:         (data)   => API.post('/blogs', data),
  update:         (id, data) => API.put(`/blogs/${id}`, data),
  updateStatus:   (id, status) => API.put(`/blogs/${id}/status`, { status }),
  toggleFeatured: (id)     => API.put(`/blogs/${id}/featured`),
  restore:        (id)     => API.put(`/blogs/${id}/restore`),
  permanentDelete:(id)     => API.delete(`/blogs/${id}/permanent`),
  delete:         (id)     => API.delete(`/blogs/${id}`),
  toggleLike:     (id)     => API.post(`/blogs/${id}/like`),
}

// ── Comments ──────────────────────────────────────────
export const commentAPI = {
  getAll: (blogId) => API.get(`/comments/${blogId}`),
  add:    (blogId, data) => API.post(`/comments/${blogId}`, data),
  delete: (id)    => API.delete(`/comments/${id}`),
}

// ── Users ─────────────────────────────────────────────
export const userAPI = {
  getProfile:       ()     => API.get('/users/profile'),
  updateProfile:    (data) => API.put('/users/profile', data),
  toggleSave:       (blogId) => API.post(`/users/save/${blogId}`),
  getSaved:         ()     => API.get('/users/saved'),
  follow:           (id)   => API.post(`/users/${id}/follow`),
  getPublicProfile: (id)   => API.get(`/users/${id}/profile`),
  getAuthorStats:   ()     => API.get('/users/author-stats'),
  getAllUsers:      ()     => API.get('/users'),
  toggleBan:        (id)   => API.put(`/users/${id}/ban`),
  deleteUser:       (id)   => API.delete(`/users/${id}`),
  addToHistory: (blogId) => API.post(`/users/history/${blogId}`),
  getHistory:   ()       => API.get('/users/history'),
}

// ── Notifications ───────────────────────────────────────
export const commentAPI = {
  getAll:        (blogId) => API.get(`/comments/${blogId}`),
  add:           (blogId, data) => API.post(`/comments/${blogId}`, data),
  edit:          (id, content) => API.put(`/comments/${id}`, { content }),
  delete:        (id)     => API.delete(`/comments/${id}`),
  toggleLike:    (id)     => API.post(`/comments/${id}/like`),
  flag:          (id, reason) => API.post(`/comments/${id}/flag`, { reason }),
  getAllAdmin:   (filter) => API.get('/comments/admin/all', { params: { filter } }),
  approve:       (id)     => API.put(`/comments/${id}/approve`),
  reject:        (id)     => API.put(`/comments/${id}/reject`),
}

// ── Upload ────────────────────────────────────────────
export const uploadAPI = {
  blogImage:    (formData) => API.post('/upload/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  profileImage: (formData) => API.post('/upload/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
export const userAPI = {
  // ...your existing methods
  getStats: () => API.get('/users/stats'),
}

// ── Newsletter ────────────────────────────────────────
export const newsletterAPI = {
  subscribe:   (email)   => API.post('/newsletter/subscribe', { email }),
  unsubscribe: (email)   => API.post('/newsletter/unsubscribe', { email }),
  send:        (data)    => API.post('/newsletter/send', data),
}


export default API
