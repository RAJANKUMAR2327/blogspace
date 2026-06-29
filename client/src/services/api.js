import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true  // ← must be true for refresh cookie to work
})

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Token refreshing state variables
let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

// Auto-handle token expiry & silent refresh queuing
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise(resolve => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(API(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Calling post directly or via explicit bypass to avoid interceptor loop
        const res = await axios.post(
          `${API.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        )
        const newToken = res.data.token
        localStorage.setItem('token', newToken)
        
        isRefreshing = false
        onRefreshed(newToken)
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return API(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register:         (data)  => API.post('/auth/register', data),
  login:            (data)  => API.post('/auth/login', data),
  logout:           ()      => API.post('/auth/logout'),
  getMe:            ()      => API.get('/auth/me'),
  forgotPassword:   (email) => API.post('/auth/forgot-password', { email }),
  resetPassword:    (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  sendVerification: ()      => API.post('/auth/send-verification'),
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
  trackCompletion: (id)    => API.post(`/blogs/${id}/complete`),
  getAnalytics:    (id)    => API.get(`/blogs/${id}/analytics`),
}

// ── Comments ──────────────────────────────────────────
export const commentAPI = {
  getAll:      (blogId) => API.get(`/comments/${blogId}`),
  add:         (blogId, data) => API.post(`/comments/${blogId}`, data),
  edit:        (id, content) => API.put(`/comments/${id}`, { content }),
  delete:      (id)     => API.delete(`/comments/${id}`),
  toggleLike:  (id)     => API.post(`/comments/${id}/like`),
  flag:        (id, reason) => API.post(`/comments/${id}/flag`, { reason }),
  getAllAdmin: (filter) => API.get('/comments/admin/all', { params: { filter } }),
  approve:     (id)     => API.put(`/comments/${id}/approve`),
  reject:      (id)     => API.put(`/comments/${id}/reject`),
}

// ── Users ─────────────────────────────────────────────
export const userAPI = {
  getProfile:           ()       => API.get('/users/profile'),
  updateProfile:        (data)   => API.put('/users/profile', data),
  toggleSave:           (blogId) => API.post(`/users/save/${blogId}`),
  getSaved:             ()       => API.get('/users/saved'),
  follow:               (id)     => API.post(`/users/${id}/follow`),
  getPublicProfile:     (id)     => API.get(`/users/${id}/profile`),
  getAuthorStats:       ()       => API.get('/users/author-stats'),
  getAllUsers:          ()       => API.get('/users'),
  toggleBan:            (id)     => API.put(`/users/${id}/ban`),
  deleteUser:           (id)     => API.delete(`/users/${id}`),
  addToHistory:         (blogId) => API.post(`/users/history/${blogId}`),
  getHistory:           ()       => API.get('/users/history'),
  getPlatformAnalytics: ()       => API.get('/users/platform-analytics'),
  getStats:             ()       => API.get('/users/stats'),
  getAuditLogs:    () => API.get('/users/audit-logs'),
  getLoginActivity: () => API.get('/users/login-activity'),
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

// ── Newsletter ────────────────────────────────────────
export const newsletterAPI = {
  subscribe:       (email, categories) => API.post('/newsletter/subscribe', { email, categories }),
  unsubscribe:     (email) => API.post('/newsletter/unsubscribe', { email }),
  getSubscribers:  ()      => API.get('/newsletter/subscribers'),
  send:            (data)  => API.post('/newsletter/send', data),
  sendDigestNow:   ()      => API.post('/newsletter/send-digest'),
}
export const aiAPI = {
  suggestTitlesAndTags: (content, category) => API.post('/ai/suggest-titles-tags', { content, category }),
  summarize:            (blogId) => API.post(`/ai/summarize/${blogId}`),
  getArticleChat:       (blogId, sessionId) => API.get(`/ai/chat/${blogId}`, { params: { sessionId } }),
  askAboutArticle:      (blogId, question, sessionId) => API.post(`/ai/chat/${blogId}`, { question, sessionId }),
  generateArticle:      (data) => API.post('/ai/generate-article', data),
  checkWriting:         (content) => API.post('/ai/check-writing', { content }),
}

export default API