import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Image from '../models/Image.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'

function norm(s) { return (s || '').toString().trim().toLowerCase() }

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')

  const images = await Image.find({ gridFsId: { $exists: true, $ne: null } })
  const byFilename = new Map(images.map(i => [norm(i.filename), i]))

  const products = await Product.find()
  let repaired = 0
  for (const p of products) {
    const needsRepair = !(typeof p.image === 'string' && p.image.startsWith('/api/images/'))
    const candidate = byFilename.get(norm(p.imageFilename)) || byFilename.get(norm((p.image||'').split('/').pop()))
    if (needsRepair && candidate) {
      p.image = `/api/images/${candidate.gridFsId}`
      await p.save()
      repaired++
    }
  }
  console.log(`Repaired ${repaired} products image URLs`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })


