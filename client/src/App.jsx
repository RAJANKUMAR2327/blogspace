import { Routes, Route } from 'react-router-dom'

// Pages
import Home           from './pages/Home'
import BlogList       from './pages/BlogList'
import SingleBlog     from './pages/SingleBlog'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Profile        from './pages/Profile'
import Categories     from './pages/Categories'
import SearchResults  from './pages/SearchResults'
import NotFound       from './pages/NotFound'

// Admin Pages
import Dashboard      from './pages/admin/Dashboard'
import CreateBlog     from './pages/admin/CreateBlog'
import EditBlog       from './pages/admin/EditBlog'
import ManageUsers    from './pages/admin/ManageUsers'
import ManageComments from './pages/admin/ManageComments'

// Components
import Navbar         from './components/common/Navbar'
import Footer         from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"                      element={<Home />} />
          <Route path="/blogs"                 element={<BlogList />} />
          <Route path="/blog/:slug"            element={<SingleBlog />} />
          <Route path="/categories"            element={<Categories />} />
          <Route path="/search"                element={<SearchResults />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/register"              element={<Register />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected User */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Protected Admin */}
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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
