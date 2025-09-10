import { Router } from 'express'
import Cart from '../models/Cart.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }) || { items: [] }
    res.json(cart)
  } catch (e) { next(e) }
})

router.post('/set', authRequired, async (req, res, next) => {
  try {
    const { items = [] } = req.body
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items } },
      { upsert: true, new: true }
    )
    res.json(cart)
  } catch (e) { next(e) }
})

export default router


