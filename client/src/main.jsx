import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, ToastBar } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'
import './styles/print.css'
import { HelmetProvider } from 'react-helmet-async'

// Configured with smart cache defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,      // data considered fresh for 5 min
      gcTime: 30 * 60 * 1000,        // keep unused cache for 30 min before garbage collecting
      refetchOnWindowFocus: false,    // don't refetch every time user tabs back in
      refetchOnReconnect: 'always',
    },
  },
})

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW failed:', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-soft)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    boxShadow: 'var(--shadow-pop)',
                  },
                  success: { iconTheme: { primary: '#34d399', secondary: 'var(--bg-surface)' } },
                  error:   { iconTheme: { primary: '#f87171', secondary: 'var(--bg-surface)' } },
                }}
              >
                {(t) => (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{
                      opacity: t.visible ? 1 : 0,
                      y: t.visible ? 0 : -20,
                      scale: t.visible ? 1 : 0.9,
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  >
                    <ToastBar toast={t} />
                  </motion.div>
                )}
              </Toaster>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)