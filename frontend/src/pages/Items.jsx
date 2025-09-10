import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { api } from '../lib/api'
import { itemsPageStyles as styles } from '../assets/dummyStyles'
import { FaSearch } from 'react-icons/fa'
import { useCart } from '../CartContent'
import { useNavigate } from 'react-router-dom'

function Items() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()
  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000'
  const resolveImage = (url) => {
    if (!url) return ''
    if (url.startsWith('/api') || url.startsWith('/static')) return `${API_URL}${url}`
    return url
  }

  useEffect(() => {
    const load = async () => {
      try {
        const ts = Date.now()
        const [cats, prods] = await Promise.all([
          api.get(`/api/products/categories?ts=${ts}`).catch(() => []),
          api.get(`/api/products?ts=${ts}`).catch(() => []),
        ])
        const normalized = (Array.isArray(prods) ? prods : []).map(p => ({
          ...p,
          name: (p.name || '').toString().trim(),
          category: (p.category || '').toString().trim(),
        }))
        const catsList = Array.isArray(cats) && cats.length
          ? cats
          : Array.from(new Set(normalized.map(p => p.category).filter(Boolean)))
        setCategories(catsList)
        setProducts(normalized)
      } catch {
        setCategories([])
        setProducts([])
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = (search || '').toLowerCase().trim()
    const selectedCat = (category || '').trim()
    return (products || []).filter(p => {
      const pname = (p.name || '').toLowerCase()
      const pcat = (p.category || '').trim()
      if (selectedCat && pcat !== selectedCat) return false
      if (term && !pname.includes(term)) return false
      return true
    })
  }, [products, search, category])

  // Dynamic-only: no static highlights

  const getQty = (productId) => {
    const found = cart.find(i => (i._id || i.id) === (productId || productId))
    return found ? found.quantity : 0
  }

  const addOne = (p) => addToCart({
    id: p._id || p.id,
    _id: p._id,
    name: p.name,
    price: Number(p.price)||0,
    image: p.image,
    category: p.category
  }, 1)

  const decOne = (p) => {
    const current = getQty(p._id || p.id)
    if (current > 1) updateQuantity(p._id || p.id, current - 1)
    else removeFromCart({ id: p._id || p.id })
  }

  const buyNow = (p) => {
    addOne(p)
    navigate('/checkout')
  }

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.mainTitle}>Browse <span className={styles.titleSpan}>Products</span></h1>
          </header>

          <div className={styles.searchContainer}>
            <div className={styles.searchForm}>
              <input value={search} onChange={(e)=>setSearch(e.target.value)} className={styles.searchInput} placeholder="Search products..." />
              <button className={styles.searchButton}><FaSearch /></button>
            </div>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="bg-emerald-800 text-emerald-100 px-4 py-2 rounded-xl border border-emerald-700">
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>


          <div className={styles.productsGrid}>
            {filtered.map(p => {
              const qty = getQty(p._id || p.id)
              return (
                <div key={p._id || p.id} className={styles.productCard}>
                  <div className={styles.imageContainer}>
                    {p.image ? <img src={resolveImage(p.image)} alt={p.name} className={styles.productImage} /> : <div />}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.titleContainer}>
                      <h3 className={styles.productTitle}>{p.name}</h3>
                      {p.isFeatured ? <span className={styles.organicTag}>Featured</span> : null}
                    </div>
                    <div className={styles.priceContainer}>
                      <span className={styles.currentPrice}>₹{Number(p.price || 0).toFixed(2)}</span>
                      <span className={styles.oldPrice}>₹{(Number(p.price || 0)*1.2).toFixed(2)}</span>
                    </div>
                    {qty === 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button onClick={()=>addOne(p)} className={styles.addButton}>Add to Cart</button>
                        <button onClick={()=>buyNow(p)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer py-3 rounded-full font-bold">Buy Now</button>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center justify-between">
                        <div className={styles.quantityControls}>
                          <button onClick={()=>decOne(p)} className={`${styles.quantityButton} ${styles.quantityButtonLeft}`}>-</button>
                          <span className={styles.quantityValue}>{qty}</span>
                          <button onClick={()=>addOne(p)} className={`${styles.quantityButton} ${styles.quantityButtonRight}`}>+</button>
                        </div>
                        <button onClick={()=>addOne(p)} className="bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer py-2 px-4 rounded-full font-bold">Buy Now</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Items
