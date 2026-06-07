import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Home from './Home'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-500/50"
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-500/50"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition shadow-lg disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center mt-8 text-gray-600">
            New here?{' '}
            <Link to="/register" className="font-bold text-pink-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}