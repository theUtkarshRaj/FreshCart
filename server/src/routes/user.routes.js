import { Router } from 'express'
import User from '../models/User.js'
import { authRequired, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (e) { next(e) }
})

router.put('/me', authRequired, async (req, res, next) => {
  try {
    const { name } = req.body
    req.user.name = name ?? req.user.name
    await req.user.save()
    res.json(req.user)
  } catch (e) { next(e) }
})

export default router


