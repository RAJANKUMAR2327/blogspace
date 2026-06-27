import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Components (keep these eager — needed immediately on every page)
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages (lazy-loaded — only downloaded when visited)
const Home             = lazy(() => import('./pages/Home'))
const BlogList         = lazy(() => import('./pages/BlogList'))
const SingleBlog       = lazy(() => import('./pages/SingleBlog'))
const Login            = lazy(() => import('./pages/Login'))
const Register         = lazy(() => import('./pages/Register'))
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword    = lazy(() => import('./pages/ResetPassword'))
const Profile          = lazy(() => import('./pages/Profile'))
const Categories       = lazy(() => import('./pages/Categories'))
const SearchResults    = lazy(() => import('./pages/SearchResults'))
const NotFound         = lazy(() => import('./pages/NotFound'))
const AuthCallback     = lazy(() => import('./pages/AuthCallback'))
const VerifyEmail      = lazy(() => import('./pages/VerifyEmail'))
const AuthorDashboard  = lazy(() => import('./pages/AuthorDashboard'))
const AuthorPage       = lazy(() => import('./pages/AuthorPage'))
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'))

// Admin pages (lazy-loaded — zero bundle cost for regular users)
const Dashboard        = lazy(() => import('./pages/admin/Dashboard'))
const CreateBlog       = lazy(() => import('./pages/admin/CreateBlog'))
const EditBlog         = lazy(() => import('./pages/admin/EditBlog'))
const ManageUsers      = lazy(() => import('./pages/admin/ManageUsers'))
const ManageComments   = lazy(() => import('./pages/admin/ManageComments'))
const PlatformAnalytics = lazy(() => import('./pages/admin/PlatformAnalytics'))

function App() {
  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/"                    element={<Home />} />
            <Route path="/blogs"               element={<BlogList />} />
            <Route path="/blog/:slug"          element={<SingleBlog />} />
            <Route path="/categories"          element={<Categories />} />
            <Route path="/search"              element={<SearchResults />} />
            <Route path="/login"               element={<Login />} />
            <Route path="/register"            element={<Register />} />
            <Route path="/forgot-password"     element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/callback"       element={<AuthCallback />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/author/:id"          element={<AuthorPage />} />

            {/* Protected User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/author-dashboard" element={
              <ProtectedRoute><AuthorDashboard /></ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/create" element={
              <ProtectedRoute adminOnly><CreateBlog /></ProtectedRoute>
            } />
            <Route path="/admin/edit/:id" element={
              <ProtectedRoute adminOnly><EditBlog /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
            } />
            <Route path="/admin/comments" element={
              <ProtectedRoute adminOnly><ManageComments /></ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly><PlatformAnalytics /></ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute adminOnly><AuditLogs /></ProtectedRoute>
            } />  

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', borderTop: '2px solid #7c3aed', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default App