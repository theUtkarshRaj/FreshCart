import fs from 'fs'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Image from '../models/Image.js'
import mime from 'mime-types'

dotenv.config()

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TRY_PRODUCTS = [
  path.resolve(__dirname, '../../../frontend/src/assets/dummyData.jsx'),
  path.resolve(process.cwd(), '../frontend/src/assets/dummyData.jsx'),
]
const TRY_GROUPS = [
  path.resolve(__dirname, '../../../frontend/src/assets/dummyDataItem.jsx'),
  path.resolve(process.cwd(), '../frontend/src/assets/dummyDataItem.jsx'),
]
const ASSETS_DIRS = [
  path.resolve(__dirname, '../../../frontend/src/assets'),
  path.resolve(process.cwd(), '../frontend/src/assets'),
]

function readIfExists(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8')
  }
  return ''
}

function resolveAssetFile(filename) {
  for (const d of ASSETS_DIRS) {
    const full = path.join(d, filename)
    if (fs.existsSync(full)) return full
  }
  return ''
}

function parseImports(source) {
  const importRegex = /import\s+(\w+)\s+from\s+['"]\.\.\/assets\/(.+?)['"]/g
  const varToFile = new Map()
  let m
  while ((m = importRegex.exec(source)) !== null) {
    varToFile.set(m[1], m[2])
  }
  return varToFile
}

function parseProducts(source) {
  const varToFile = parseImports(source)
  const productsSectionMatch = source.match(/export\s+const\s+products\s*=\s*\[([\s\S]*?)\]/)
  if (!productsSectionMatch) return []
  const body = productsSectionMatch[1]
  const objRegex = /\{\s*id:\s*[^,]+,\s*name:\s*'([^']*)'\s*,\s*price:\s*([^,]+),\s*category:\s*'([^']*)'\s*,\s*image:\s*(\w+)\s*\}/g
  const results = []
  let mo
  while ((mo = objRegex.exec(body)) !== null) {
    const name = (mo[1] || '').trim()
    const category = (mo[3] || '').trim()
    const imageVar = mo[4]
    const file = varToFile.get(imageVar) || ''
    results.push({ name, category, filename: file })
  }
  return results
}

function parseGroups(source) {
  const varToFile = parseImports(source)
  const groupsMatch = source.match(/export\s+const\s+groceryData\s*=\s*\[([\s\S]*?)\];?/)
  if (!groupsMatch) return []
  const body = groupsMatch[1]
  const groupRegex = /name:\s*"([^"]+)"[\s\S]*?items:\s*\[([\s\S]*?)\]/g
  const itemRegex = /\{\s*id:\s*[^,]+,\s*name:\s*"([^"]+)",[\s\S]*?image:\s*(\w+)[^}]*\}/g
  const results = []
  let g
  while ((g = groupRegex.exec(body)) !== null) {
    const groupName = (g[1] || '').trim()
    const itemsBlock = g[2] || ''
    let it
    while ((it = itemRegex.exec(itemsBlock)) !== null) {
      const name = (it[1] || '').trim()
      const imageVar = it[2]
      const file = varToFile.get(imageVar) || ''
      results.push({ name, category: groupName, filename: file })
    }
  }
  return results
}

function norm(s) { return (s || '').toString().trim().toLowerCase() }

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
  const srcProducts = readIfExists(TRY_PRODUCTS)
  const srcGroups = readIfExists(TRY_GROUPS)
  const listA = srcProducts ? parseProducts(srcProducts) : []
  const listB = srcGroups ? parseGroups(srcGroups) : []
  let pairs = [...listA, ...listB].filter(x => x.filename)
  // dedupe
  pairs = pairs.filter((p, i, arr) => arr.findIndex(x => norm(x.name)+"|"+norm(x.filename) === norm(p.name)+"|"+norm(p.filename)) === i)

  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
  const db = mongoose.connection.db
  const bucket = new mongoose.mongo.GridFSBucket(db)

  let uploaded = 0, linked = 0
  for (const pair of pairs) {
    const abs = resolveAssetFile(pair.filename)
    if (!abs) continue
    const buffer = fs.readFileSync(abs)
    const contentType = mime.lookup(path.extname(pair.filename || '')) || 'application/octet-stream'
    const uploadStream = bucket.openUploadStream(pair.filename, { contentType })
    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (err) => err ? reject(err) : resolve())
    })
    const fileId = uploadStream.id
    const imgDoc = await Image.create({ name: pair.name, filename: pair.filename, gridFsId: fileId, source: 'upload' })
    uploaded++
    // link product by name (and if existing image filename matches)
    const prod = await Product.findOne({ name: pair.name })
    if (prod) {
      prod.image = `/api/images/${fileId}`
      prod.imageFilename = pair.filename
      await prod.save()
      linked++
    }
  }
  console.log(`Uploaded ${uploaded} images to GridFS, linked ${linked} products`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })


