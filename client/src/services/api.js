import axios from 'axios'

// ─────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

// ─────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),

  login: (data) => API.post('/auth/login', data),

  getMe: () => API.get('/auth/me'),

  forgotPassword: (data) =>
    API.post('/auth/forgot-password', data),

  resetPassword: (token, data) =>
    API.put(`/auth/reset-password/${token}`, data)
}

// ─────────────────────────────────────────
// Blog API
// ─────────────────────────────────────────
export const blogAPI = {
  getAll: (params) =>
    API.get('/blogs', { params }),

  getBySlug: (slug) =>
    API.get(`/blogs/${slug}`),

  create: (data) =>
    API.post('/blogs', data),

  update: (id, data) =>
    API.put(`/blogs/${id}`, data),

  delete: (id) =>
    API.delete(`/blogs/${id}`),

  toggleLike: (id) =>
    API.post(`/blogs/${id}/like`)
}

// ─────────────────────────────────────────
// Comment API
// ─────────────────────────────────────────
export const commentAPI = {
  getAll: (blogId) =>
    API.get(`/comments/${blogId}`),

  add: (blogId, data) =>
    API.post(`/comments/${blogId}`, data),

  delete: (id) =>
    API.delete(`/comments/${id}`)
}

// ─────────────────────────────────────────
// User API
// ─────────────────────────────────────────
export const userAPI = {
  // Profile
  getProfile: () =>
    API.get('/users/profile'),

  updateProfile: (data) =>
    API.put('/users/profile', data),

  // Saved Blogs
  toggleSave: (blogId) =>
    API.post(`/users/save/${blogId}`),

  getSaved: () =>
    API.get('/users/saved'),

  // Reading History
  addToHistory: (blogId) =>
    API.post(`/users/history/${blogId}`),

  getHistory: () =>
    API.get('/users/history'),

  // Follow Users
  followToggle: (id) =>
    API.post(`/users/${id}/follow`),

  // Admin
  getAllUsers: () =>
    API.get('/users'),

  toggleBan: (id) =>
    API.put(`/users/${id}/ban`),

  deleteUser: (id) =>
    API.delete(`/users/${id}`)
}

// ─────────────────────────────────────────
// Upload API
// ─────────────────────────────────────────
export const uploadAPI = {
  blogImage: (formData) =>
    API.post('/upload/blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  profileImage: (formData) =>
    API.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}

// ─────────────────────────────────────────
// Newsletter API
// ─────────────────────────────────────────
export const newsletterAPI = {
  subscribe: (email) =>
    API.post('/newsletter/subscribe', { email })
}

export default API