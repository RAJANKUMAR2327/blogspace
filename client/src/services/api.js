import axios from 'axios'

// ─────────────────────────────────────────
// STEP 7A: Axios instance with base URL
// ─────────────────────────────────────────
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

// ─────────────────────────────────────────
// STEP 7B: Request interceptor — attach JWT token automatically
// ─────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─────────────────────────────────────────
// STEP 7C: Response interceptor — auto-logout on 401
// ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────
// STEP 7D: Auth API calls
// ─────────────────────────────────────────
export const authAPI = {
  register:      (data)  => API.post('/auth/register', data),
  login:         (data)  => API.post('/auth/login', data),
  getMe:         ()      => API.get('/auth/me'),
  forgotPassword:(data)  => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
}

// Blogs
export const blogAPI = {
  getAll:     (params) => API.get('/blogs', { params }),
  getBySlug:  (slug)   => API.get(`/blogs/${slug}`),
  create:     (data)   => API.post('/blogs', data),
  update:     (id, data) => API.put(`/blogs/${id}`, data),
  delete:     (id)     => API.delete(`/blogs/${id}`),
  toggleLike: (id)     => API.post(`/blogs/${id}/like`),
}

// Comments
export const commentAPI = {
  getAll: (blogId)       => API.get(`/comments/${blogId}`),
  add:    (blogId, data) => API.post(`/comments/${blogId}`, data),
  delete: (id)           => API.delete(`/comments/${id}`),
}

// Users
export const userAPI = {
  getProfile:  ()      => API.get('/users/profile'),
  updateProfile:(data) => API.put('/users/profile', data),
  toggleSave:  (blogId)=> API.post(`/users/save/${blogId}`),
  getSaved:    ()      => API.get('/users/saved'),
  getAllUsers:  ()      => API.get('/users'),
  toggleBan:   (id)    => API.put(`/users/${id}/ban`),
  deleteUser:  (id)    => API.delete(`/users/${id}`),
}

// Newsletter
export const newsletterAPI = {
  subscribe: (email) => API.post('/newsletter/subscribe', { email }),
}

export default API
// Upload
export const uploadAPI = {
  blogImage: (formData) => API.post('/upload/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  profileImage: (formData) => API.post('/upload/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}