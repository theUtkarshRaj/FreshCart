const API_URL = (import.meta.env && import.meta.env.VITE_API_URL);

const authHeader = () => {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_URL}${path}`, { headers: { ...authHeader() } })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  async post(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  async put(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  async del(path) {
    const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers: { ...authHeader() } })
    if (!res.ok) throw new Error(await res.text())
    return res.text()
  }
}


