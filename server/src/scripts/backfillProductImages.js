import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Image from '../models/Image.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'

function normalizeName(s) {
  return (s || '').toString().trim().toLowerCase()
}

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')

  const images = await Image.find()
  const byKey = new Map()
  for (const img of images) {
    const nameKey = `${normalizeName(img.name)}|${normalizeName(img.filename)}`
    byKey.set(nameKey, img)
    const nameOnly = `${normalizeName(img.name)}|`
    if (!byKey.has(nameOnly)) byKey.set(nameOnly, img)
    const fileOnly = `|${normalizeName(img.filename)}`
    if (!byKey.has(fileOnly)) byKey.set(fileOnly, img)
  }

  const products = await Product.find()
  let updated = 0
  for (const p of products) {
    const hasGoodUrl = typeof p.image === 'string' && p.image.startsWith('/static/assets/')
    if (hasGoodUrl) continue
    const filename = (p.image || '').split('/').pop()
    const k1 = `${normalizeName(p.name)}|${normalizeName(filename)}`
    const k2 = `${normalizeName(p.name)}|`
    const k3 = `|${normalizeName(filename)}`
    const match = byKey.get(k1) || byKey.get(k2) || byKey.get(k3)
    if (match) {
      p.image = match.url
      await p.save()
      updated++
    }
  }
  console.log(`Updated ${updated} products with image URLs`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })


