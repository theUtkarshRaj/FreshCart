import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) { setLoading(false); return }
    api.get('/api/auth/me').then((data) => setUser(data.user)).catch(() => {
      localStorage.removeItem('authToken')
    }).finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('authToken', token)
    setUser(userData)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


