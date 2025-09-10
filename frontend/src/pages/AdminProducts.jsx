import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { api } from '../lib/api'
import ProtectedRoute from '../components/ProtectedRoute'

function AdminProducts() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name:'', price:'', category:'', stock:'', description:'', imageFile:null })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const prods = await api.get('/api/products').catch(() => [])
    setList(Array.isArray(prods) ? prods : [])
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const uploadImage = async (file) => {
    const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000'
    setUploading(true)
    const res = await fetch(`${API_URL}/api/images/upload`, {
      method: 'POST',
      headers: { 'x-filename': file.name, Authorization: `Bearer ${localStorage.getItem('authToken')||''}` },
      body: file
    })
    setUploading(false)
    if (!res.ok) throw new Error('upload failed')
    const data = await res.json()
    return `/api/images/${data.fileId}`
  }

  const create = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      let image = ''
      if (form.imageFile) image = await uploadImage(form.imageFile)
      await api.post('/api/products', {
        name: form.name.trim(),
        price: Number(form.price||0),
        category: form.category.trim(),
        stock: Number(form.stock||0),
        description: form.description||'',
        image
      })
      setForm({ name:'', price:'', category:'', stock:'', description:'', imageFile:null })
      await load()
    } catch {
      // swallow
    } finally { setSaving(false) }
  }

  const remove = async (id) => { await api.del(`/api/products/${id}`); load() }

  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000'
  const resolveImage = (url) => url && (url.startsWith('/api')||url.startsWith('/static')) ? `${API_URL}${url}` : url

  return (
    <ProtectedRoute requireAdmin>
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-emerald-900/40 rounded-2xl border border-emerald-700 p-4">
              <h2 className="text-emerald-100 font-bold text-xl mb-4">Products</h2>
              <div className="space-y-3">
                {list.map(p => (
                  <div key={p._id} className="flex items-center justify-between bg-emerald-900/40 rounded-xl p-3 border border-emerald-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-950 rounded-md overflow-hidden flex items-center justify-center">
                        {p.image ? <img src={resolveImage(p.image)} className="w-10 h-10 object-contain" /> : null}
                      </div>
                      <div>
                        <div className="text-emerald-100 font-semibold">{p.name}</div>
                        <div className="text-emerald-300 text-sm">₹{Number(p.price||0).toFixed(2)} • {p.category||'Uncategorized'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>remove(p._id)} className="px-3 py-1 rounded-full bg-red-500 text-white">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900/40 rounded-2xl border border-emerald-700 p-4">
              <h2 className="text-emerald-100 font-bold text-xl mb-4">Create Product</h2>
              <form onSubmit={create} className="space-y-3">
                <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-100" />
                <input name="price" value={form.price} onChange={onChange} type="number" step="0.01" placeholder="Price" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-100" />
                <input name="category" value={form.category} onChange={onChange} placeholder="Category" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-100" />
                <input name="stock" value={form.stock} onChange={onChange} type="number" placeholder="Stock" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-100" />
                <textarea name="description" value={form.description} onChange={onChange} placeholder="Description" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-100" />
                <input type="file" accept="image/*" onChange={(e)=>setForm({...form, imageFile: e.target.files?.[0] || null})} className="w-full text-emerald-100" />
                <button disabled={saving||uploading} className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold w-full">{saving? 'Saving...' : (uploading ? 'Uploading...' : 'Create')}</button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default AdminProducts


