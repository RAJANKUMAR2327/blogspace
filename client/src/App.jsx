import { Routes, Route } from 'react-router-dom'
import { useContext } from 'react'
import { ThemeContext } from './context/ThemeContext'

// Pages
import Home           from './pages/Home'
import BlogList       from './pages/BlogList'
import SingleBlog     from './pages/SingleBlog'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'   // STEP 13A: NEW
import ResetPassword  from './pages/ResetPassword'    // STEP 13B: NEW
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
  const { theme } = useContext(ThemeContext)

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/"                         element={<Home />} />
            <Route path="/blogs"                    element={<BlogList />} />
            <Route path="/blog/:slug"               element={<SingleBlog />} />
            <Route path="/categories"               element={<Categories />} />
            <Route path="/search"                   element={<SearchResults />} />
            <Route path="/login"                    element={<Login />} />
            <Route path="/register"                 element={<Register />} />
            <Route path="/forgot-password"          element={<ForgotPassword />} />     {/* STEP 13A */}
            <Route path="/reset-password/:token"    element={<ResetPassword />} />      {/* STEP 13B */}

            {/* Protected User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
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

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
