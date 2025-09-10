import { Router } from 'express'
import Product from '../models/Product.js'
import { authRequired, adminOnly } from '../middleware/auth.js'
import Image from '../models/Image.js'
import mongoose from 'mongoose'

const router = Router()

// Optional dev seeding from frontend assets (enable by setting ALLOW_DEV_SEED=true in .env)
if (process.env.ALLOW_DEV_SEED === 'true') {
  router.post('/seed', async (req, res, next) => {
    try {
      const { products } = req.body || {}
      if (!Array.isArray(products) || !products.length) {
        return res.status(400).json({ message: 'No products provided' })
      }
      // Normalize minimal fields used by our model
      const docs = products.map(p => ({
        name: String(p.name || '').trim(),
        description: String(p.description || ''),
        price: Number(p.price || 0),
        image: String(p.image || ''),
        category: String(p.category || ''),
        stock: Number(p.stock ?? 100),
        isFeatured: Boolean(p.isFeatured || false),
        discountPercent: Number(p.discountPercent || 0)
      })).filter(p => p.name && p.price >= 0)

      // Replace existing collection for convenience in dev
      await Product.deleteMany({})
      const created = await Product.insertMany(docs)
      res.status(201).json({ inserted: created.length })
    } catch (e) { next(e) }
  })
}

router.get('/', async (req, res, next) => {
  try {
    const { search, category, featured } = req.query
    const q = {}
    if (search) q.name = { $regex: search, $options: 'i' }
    if (category) q.category = category
    if (featured) q.isFeatured = featured === 'true'
    const list = await Product.find(q).sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
})

router.get('/categories', async (req, res, next) => {
  try {
    const cats = await Product.distinct('category')
    res.json(cats)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id)
    if (!p) return res.status(404).json({ message: 'Not Found' })
    res.json(p)
  } catch (e) { next(e) }
})

router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const created = await Product.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const body = req.body || {}
    // If frontend sends imageFilename and file exists in Images/GridFS, repair image URL
    if (body.imageFilename && (!body.image || String(body.image).startsWith('/api/images/') === false)) {
      const img = await Image.findOne({ filename: body.imageFilename })
      if (img?.gridFsId) {
        body.image = `/api/images/${img.gridFsId}`
      }
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, body, { new: true })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) { next(e) }
})

export default router


