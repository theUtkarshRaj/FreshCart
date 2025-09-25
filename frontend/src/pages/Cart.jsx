import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useCart } from '../CartContent'
import { useNavigate, Link } from 'react-router-dom'

function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL);
  const resolveImage = (url) => {
    if (!url) return ''
    if (url.startsWith('/api') || url.startsWith('/static')) return `${API_URL}${url}`
    return url
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-emerald-100 mb-6">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="bg-emerald-800/50 rounded-2xl p-8 text-center border border-emerald-700">
              <p className="text-emerald-200 mb-4">Your cart is empty.</p>
              <Link to="/items" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2 rounded-full">Browse items</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-emerald-900/40 rounded-xl p-4 border border-emerald-700">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-emerald-900 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={resolveImage(item.image)} alt={item.name} className="object-contain w-12 h-12" />
                        ) : (
                          <span className="text-emerald-300 text-sm">No Image</span>
                        )}
                      </div>
                      <div>
                        <p className="text-emerald-100 font-semibold">{item.name}</p>
                        <p className="text-emerald-300 text-sm">₹{Number(item.price||0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1 rounded-full bg-emerald-800 text-emerald-200">-</button>
                      <span className="text-emerald-100 font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 rounded-full bg-emerald-800 text-emerald-200">+</button>
                      <button onClick={() => removeFromCart(item)} className="ml-4 text-red-300 hover:text-red-200">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-800/40 rounded-2xl p-6 border border-emerald-700 h-fit">
                <h2 className="text-emerald-100 font-bold text-xl mb-4">Order Summary</h2>
                <div className="flex justify-between text-emerald-200 mb-2">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-200 mb-2">
                  <span>Delivery</span>
                  <span>₹0.00</span>
                </div>
                <div className="h-px bg-emerald-700 my-4" />
                <div className="flex justify-between text-emerald-100 font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <button onClick={()=>navigate('/checkout')} className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl">Proceed to Checkout</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cart


