import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { api } from '../lib/api'
import { ordersPageStyles as styles } from '../assets/dummyStyles'

function Myorder() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/orders/my').then(setOrders).catch(() => setError('Please login to view orders'))
  }, [])

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.mainTitle}>My <span className={styles.titleSpan}>Orders</span></h1>
            <p className={styles.subtitle}>View your recent purchases</p>
          </header>
          {error && <div className="text-center text-amber-300 mb-4">{error}</div>}
          <div className={styles.ordersTable}>
            {orders.length === 0 ? (
              <div className="p-6 text-center text-emerald-200">No orders to show.</div>
            ) : (
              <div>
                {orders.map(o => (
                  <div key={o._id} className="border-b border-emerald-700/50 p-4">
                    <div className="flex justify-between text-emerald-100">
                      <span>Order #{o._id}</span>
                      <span className="capitalize">{o.status}</span>
                    </div>
                    <div className="text-emerald-300">Total: ₹{Number(o.totalAmount || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Myorder
