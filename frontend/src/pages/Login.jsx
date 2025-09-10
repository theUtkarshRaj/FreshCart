import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.token, res.user)
      navigate('/')
    } catch (e) {
      setError('Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 pt-24 pb-12">
        <div className="max-w-md mx-auto bg-emerald-900/40 p-8 rounded-2xl border border-emerald-700">
          <h1 className="text-2xl font-bold text-emerald-100 mb-6 text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-4 py-2 text-emerald-100" />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-1">Password</label>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-4 py-2 text-emerald-100" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-lg">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p className="text-center text-emerald-200 text-sm mt-4">
            Don’t have an account? <Link to="/signup" className="text-emerald-300 underline">Create one</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login


