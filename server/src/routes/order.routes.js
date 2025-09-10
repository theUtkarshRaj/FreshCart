import { Router } from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { authRequired, adminOnly } from '../middleware/auth.js'

const router = Router()

router.post('/', authRequired, async (req, res, next) => {
  let session
  const createWithSession = async (useSession) => {
    const { items = [], deliveryAddress = {}, paymentMethod = 'cod' } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      throw Object.assign(new Error('No items provided'), { status: 400 })
    }

    const productIds = items.map(i => i.product).map(id => {
      try { return new mongoose.Types.ObjectId(id) } catch { return null }
    }).filter(Boolean)
    if (productIds.length === 0) throw Object.assign(new Error('Invalid product ids'), { status: 400 })

    const products = useSession
      ? await Product.find({ _id: { $in: productIds } }).session(useSession)
      : await Product.find({ _id: { $in: productIds } })
    const idToProduct = new Map(products.map(p => [String(p._id), p]))

    let total = 0
    const orderItems = []
    for (const i of items) {
      let key
      try { key = String(new mongoose.Types.ObjectId(i.product)) } catch { key = null }
      const prod = key ? idToProduct.get(key) : null
      if (!prod) throw Object.assign(new Error('Product not found'), { status: 400 })
      const qty = Math.max(1, Number(i.quantity || 1))
      if (prod.stock < qty) throw Object.assign(new Error(`${prod.name} is out of stock`), { status: 400 })
      prod.stock -= qty
      await prod.save(useSession ? { session: useSession } : {})
      total += Number(prod.price) * qty
      orderItems.push({ product: prod._id, name: prod.name, price: Number(prod.price), quantity: qty, image: prod.image || '' })
    }

    const doc = { user: req.user._id, items: orderItems, deliveryAddress, paymentMethod, totalAmount: total }
    if (useSession) return (await Order.create([doc], { session: useSession }))[0]
    return await Order.create(doc)
  }

  try {
    session = await mongoose.startSession(); session.startTransaction()
    const created = await createWithSession(session)
    await session.commitTransaction(); session.endSession()
    return res.status(201).json(created)
  } catch (e) {
    if (session) { await session.abortTransaction().catch(()=>{}); session.endSession() }
    const msg = String(e?.message || '')
    if (msg.includes('Transaction numbers are only allowed') || msg.includes('replica set')) {
      try { const created = await createWithSession(null); return res.status(201).json(created) } catch (inner) { return next(inner) }
    }
    return next(e)
  }
})

router.get('/my', authRequired, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (e) { next(e) }
})

router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json(orders)
  } catch (e) { next(e) }
})

router.patch('/:id/status', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    res.json(updated)
  } catch (e) { next(e) }
})

export default router


