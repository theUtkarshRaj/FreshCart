import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Image from '../models/Image.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
const norm = (s) => (s || '').toString().trim().toLowerCase()

async function dedupeProducts() {
  const all = await Product.find()
  const groups = new Map()
  for (const p of all) {
    const key = `${norm(p.name)}|${norm(p.category)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  }
  let removed = 0
  for (const arr of groups.values()) {
    if (arr.length <= 1) continue
    // Keep the oldest (first created), remove the rest
    arr.sort((a,b) => a.createdAt - b.createdAt)
    const keep = arr[0]
    const drop = arr.slice(1).map(d => d._id)
    if (drop.length) {
      await Product.deleteMany({ _id: { $in: drop } })
      removed += drop.length
      // Optionally ensure kept has imageFilename if missing and others had it
      if (!keep.imageFilename) {
        const withFilename = arr.find(x => x.imageFilename)
        if (withFilename) {
          keep.imageFilename = withFilename.imageFilename
          await keep.save()
        }
      }
    }
  }
  return removed
}

async function dedupeImages() {
  const all = await Image.find()
  const groups = new Map()
  for (const i of all) {
    const key = norm(i.filename) || norm(i.name)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(i)
  }
  let removed = 0
  for (const arr of groups.values()) {
    if (arr.length <= 1) continue
    // Prefer one that has gridFsId; else keep oldest
    const withGrid = arr.filter(x => x.gridFsId)
    let keep
    if (withGrid.length) {
      keep = withGrid[0]
    } else {
      arr.sort((a,b) => a.createdAt - b.createdAt)
      keep = arr[0]
    }
    const drop = arr.filter(x => String(x._id) !== String(keep._id)).map(x => x._id)
    if (drop.length) {
      await Image.deleteMany({ _id: { $in: drop } })
      removed += drop.length
    }
  }
  return removed
}

async function removeOrphanImages() {
  const images = await Image.find()
  const products = await Product.find({}, { image: 1 })
  const usedUrls = new Set(products.map(p => p.image))
  const orphans = images.filter(i => i.gridFsId && !usedUrls.has(`/api/images/${i.gridFsId}`))
  if (orphans.length) {
    await Image.deleteMany({ _id: { $in: orphans.map(o => o._id) } })
  }
  return orphans.length
}

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
  const prodRemoved = await dedupeProducts()
  const imgRemoved = await dedupeImages()
  const orphansRemoved = await removeOrphanImages()
  console.log(`Removed duplicates: products=${prodRemoved}, images=${imgRemoved}, orphanImages=${orphansRemoved}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })


