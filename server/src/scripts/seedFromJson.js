import fs from 'fs'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'

dotenv.config()

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
const DATA_PATH = path.resolve(__dirname, '../../data/products.json')

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found at ${DATA_PATH}. Create it with an array of products.`)
    process.exit(1)
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  let products
  try {
    products = JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse JSON:', e.message)
    process.exit(1)
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error('products.json must be a non-empty array')
    process.exit(1)
  }

  const normalized = products.map(p => ({
    name: String(p.name || '').trim(),
    description: String(p.description || ''),
    price: Number(p.price || 0),
    image: String(p.image || ''),
    category: String(p.category || '').trim(),
    stock: Number(p.stock ?? 100),
    isFeatured: Boolean(p.isFeatured || false),
    discountPercent: Number(p.discountPercent || 0),
  })).filter(p => p.name && p.category)

  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
  await Product.deleteMany({})
  const created = await Product.insertMany(normalized)
  console.log(`Inserted ${created.length} products`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


