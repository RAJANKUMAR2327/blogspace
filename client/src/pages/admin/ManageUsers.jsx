import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiSlash, FiCheck } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function ManageUsers() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers()
      return res.data.users
    }
  })

  const banMutation = useMutation({
    mutationFn: (id) => userAPI.toggleBan(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers'])
      toast.success('User status updated')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers'])
      toast.success('User deleted')
    }
  })

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Manage Users ({data?.length || 0})
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profileImage || `https://placehold.co/36x36/9333ea/ffffff?text=${user.name?.[0]}`}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.isBanned
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    }`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => banMutation.mutate(user._id)}
                        title={user.isBanned ? 'Unban' : 'Ban'}
                        className={`transition-colors ${
                          user.isBanned
                            ? 'text-green-500 hover:text-green-700'
                            : 'text-yellow-500 hover:text-yellow-700'
                        }`}
                      >
                        {user.isBanned ? <FiCheck size={16} /> : <FiSlash size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this user?')) deleteMutation.mutate(user._id)
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}