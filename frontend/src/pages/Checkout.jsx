import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useCart } from '../CartContent'
import { itemsPageStyles as styles, checkoutStyles } from '../assets/dummyStyles'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

function Checkout() {
  const { cart, clearCart, getCartTotal, removeFromCart } = useCart()
  const navigate = useNavigate()
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)
  const [address, setAddress] = React.useState({ fullName:'', phone:'', addressLine1:'', addressLine2:'', city:'', state:'', postalCode:'' })
  const [paymentMethod, setPaymentMethod] = React.useState('cod')
  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL);
  const resolveImage = (url) => {
    if (!url) return ''
    if (url.startsWith('/api') || url.startsWith('/static')) return `${API_URL}${url}`
    return url
  }

  const placeOrder = async () => {
    setError('')
    if (!cart.length) { setError('Your cart is empty'); return }
    setSaving(true)
    try {
      const items = cart.map(i => ({ product: i._id || i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }))
      const body = { items, deliveryAddress: address, paymentMethod, totalAmount: getCartTotal() }
      await api.post('/api/orders', body)
      setSuccess(true)
      clearCart()
      setTimeout(() => navigate('/myorders'), 1500)
    } catch (e) {
      setError('Failed to place order')
    } finally { setSaving(false) }
  }

  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <div className={checkoutStyles.page}>
          <div className={checkoutStyles.container}>
            <header className={checkoutStyles.header}>
              <h1 className={checkoutStyles.mainTitle}>Checkout</h1>
              <p className={checkoutStyles.subtitle}>Confirm your details and place order</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className={checkoutStyles.card}>
                  <h2 className={checkoutStyles.sectionTitle}>Delivery information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={address.fullName} onChange={e=>setAddress({...address,fullName:e.target.value})} placeholder="Full name" className={checkoutStyles.input} />
                    <input value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value})} placeholder="Phone" className={checkoutStyles.input} />
                    <input value={address.addressLine1} onChange={e=>setAddress({...address,addressLine1:e.target.value})} placeholder="Address line 1" className={checkoutStyles.input} />
                    <input value={address.addressLine2} onChange={e=>setAddress({...address,addressLine2:e.target.value})} placeholder="Address line 2" className={checkoutStyles.input} />
                    <input value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} placeholder="City" className={checkoutStyles.input} />
                    <input value={address.state} onChange={e=>setAddress({...address,state:e.target.value})} placeholder="State" className={checkoutStyles.input} />
                    <input value={address.postalCode} onChange={e=>setAddress({...address,postalCode:e.target.value})} placeholder="Postal code" className={checkoutStyles.input} />
                  </div>
                </div>

                <div className={checkoutStyles.card}>
                  <h2 className={checkoutStyles.sectionTitle}>Payment</h2>
                  <label className={checkoutStyles.radioCard}><input type="radio" name="pm" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} className="mr-3" />Cash on delivery</label>
                  <label className={checkoutStyles.radioCard}><input type="radio" name="pm" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} className="mr-3" />Card (coming soon)</label>
                </div>
              </div>

              <div>
                <div className={checkoutStyles.summaryCard}>
                  <h2 className={checkoutStyles.sectionTitle}>Order summary</h2>
                  <div className="space-y-2">
                    {cart.map(i => (
                      <div key={i.id} className={checkoutStyles.cartItem}>
                        <div className={checkoutStyles.cartImage}>{i.image ? <img src={resolveImage(i.image)} alt={i.name} className="w-12 h-12 object-contain" /> : null}</div>
                        <div className="flex-1">
                          <div className="text-emerald-100 font-medium">{i.name}</div>
                          <div className="text-emerald-300 text-sm">x{i.quantity}</div>
                          <button onClick={()=>removeFromCart(i)} className="text-red-300 hover:text-red-200 text-xs mt-1">Remove</button>
                        </div>
                        <div className="text-emerald-100 font-semibold">₹{(i.price*i.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className={checkoutStyles.orderSummaryDivider} />
                  <div className={checkoutStyles.orderSummaryTotalRow}>
                    <span className={checkoutStyles.orderSummaryTotalLabel}>Total</span>
                    <span className={checkoutStyles.orderSummaryTotalValue}>₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  {error && <div className="text-red-400 mt-3">{error}</div>}
                  <button disabled={saving || !cart.length} onClick={placeOrder} className={`${checkoutStyles.button} ${checkoutStyles.submitButton} mt-4`}>
                    {saving ? 'Placing order...' : 'Place order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-2xl">
              <div className="text-2xl font-bold text-emerald-600 mb-1">Order placed successfully</div>
              <div className="text-gray-600 mb-4">Redirecting you shortly...</div>
              <button onClick={()=>setSuccess(false)} className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold">Close</button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default Checkout


