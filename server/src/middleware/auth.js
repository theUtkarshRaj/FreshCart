import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Unauthorized' })
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    const user = await User.findById(payload.id).select('-password')
    if (!user) return res.status(401).json({ message: 'Unauthorized' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  next()
}


