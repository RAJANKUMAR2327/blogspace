import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AuthContext } from '../context/AuthContext'
import { userAPI } from '../services/api'

// Shares the exact same ['savedBlogs'] cache Profile.jsx's Saved tab uses —
// if that's already been fetched this session, this is free (no extra
// network request). Lets any BlogCard, anywhere, know whether the viewer
// has already bookmarked a given article.
export function useSavedBlogIds() {
  const { user } = useContext(AuthContext)

  const { data } = useQuery({
    queryKey: ['savedBlogs'],
    queryFn: async () => {
      const res = await userAPI.getSaved()
      return res.data.blogs || res.data
    },
    enabled: !!user,
    staleTime: 60_000
  })

  return new Set((data || []).map(b => b._id))
}
