import axios from 'axios'

// ─── Axios instance ─────────────────────────────────────────────
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

// ─── Attach JWT automatically ───────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auto-logout on 401 ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) =>
    API.put(`/auth/reset-password/${token}`, data),
}

// ─── Blogs ──────────────────────────────────────────────────────
export const blogAPI = {
  getAll: (params) => API.get('/blogs', { params }),
  getTrending: () => API.get('/blogs/trending'),
  getBySlug: (slug) => API.get(`/blogs/${slug}`),
  create: (data) => API.post('/blogs', data),
  update: (id, data) => API.put(`/blogs/${id}`, data),
  delete: (id) => API.delete(`/blogs/${id}`),
  toggleLike: (id) => API.post(`/blogs/${id}/like`),
  clapBlog: (id) => API.post(`/blogs/${id}/clap`),
}

// ─── Comments ───────────────────────────────────────────────────
export const commentAPI = {
  getAll: (blogId) => API.get(`/comments/${blogId}`),
  add: (blogId, data) => API.post(`/comments/${blogId}`, data),
  addReply: (blogId, data) => API.post(`/comments/${blogId}`, data),
  delete: (id) => API.delete(`/comments/${id}`),
  adminGetAll: () => API.get('/comments'),
}

// ─── Users ──────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),

  toggleSave: (blogId) => API.post(`/users/save/${blogId}`),
  getSaved: () => API.get('/users/saved'),

  getHistory: () => API.get('/users/history'),
  addToHistory: (blogId) => API.post(`/users/history/${blogId}`),

  followToggle: (id) => API.post(`/users/${id}/follow`),

  // Additional methods
  follow: (id) => API.post(`/users/follow/${id}`),
  getPublicProfile: (id) => API.get(`/users/${id}/profile`),

  getAllUsers: () => API.get('/users'),
  getStats: () => API.get('/users/stats'),
  toggleBan: (id) => API.put(`/users/${id}/ban`),
  deleteUser: (id) => API.delete(`/users/${id}`),
}

// ─── Notifications ──────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  getUnread: () => API.get('/notifications/unread'),
  markAllRead: () => API.put('/notifications/mark-read'),
  delete: (id) => API.delete(`/notifications/${id}`),
}

// ─── Newsletter ─────────────────────────────────────────────────
export const newsletterAPI = {
  subscribe: (email) =>
    API.post('/newsletter/subscribe', { email }),
}

// ─── Upload ─────────────────────────────────────────────────────
export const uploadAPI = {
  blogImage: (formData) =>
    API.post('/upload/blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  profileImage: (formData) =>
    API.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
}

export default API