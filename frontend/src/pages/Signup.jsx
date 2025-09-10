import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = React.useState({ name: '', email: '', password: '' })
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/api/auth/signup', form)
      login(res.token, res.user)
      navigate('/')
    } catch {
      setError('Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 pt-24 pb-12">
        <div className="max-w-md mx-auto bg-emerald-900/40 p-8 rounded-2xl border border-emerald-700">
          <h1 className="text-2xl font-bold text-emerald-100 mb-6 text-center">Create account</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-4 py-2 text-emerald-100" />
            <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-4 py-2 text-emerald-100" />
            <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-4 py-2 text-emerald-100" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-lg">{loading ? 'Creating...' : 'Sign up'}</button>
          </form>
          <p className="text-center text-emerald-200 text-sm mt-4">Already have an account? <Link to="/login" className="text-emerald-300 underline">Login</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Signup


