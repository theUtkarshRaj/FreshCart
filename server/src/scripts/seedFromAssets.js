import fs from 'fs'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Image from '../models/Image.js'

dotenv.config()

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FRONTEND_DUMMY_PATH = path.resolve(__dirname, '../../frontend_src_assets_dummyData.jsx')
// We expect a copy of the frontend file to be accessible; resolve actual path two levels up
const TRY_PRODUCTS = [
  path.resolve(__dirname, '../../../frontend/src/assets/dummyData.jsx'),
  path.resolve(process.cwd(), '../frontend/src/assets/dummyData.jsx'),
]
const TRY_GROUPS = [
  path.resolve(__dirname, '../../../frontend/src/assets/dummyDataItem.jsx'),
  path.resolve(process.cwd(), '../frontend/src/assets/dummyDataItem.jsx'),
]

function readIfExists(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8')
  }
  return ''
}

function parseProducts(source) {
  // Map import variable -> filename
  const importRegex = /import\s+(\w+)\s+from\s+['"]\.\.\/assets\/(.+?)['"]/g
  const varToFile = new Map()
  let m
  while ((m = importRegex.exec(source)) !== null) {
    varToFile.set(m[1], m[2])
  }
  // Extract products array entries
  const productsSectionMatch = source.match(/export\s+const\s+products\s*=\s*\[([\s\S]*?)\]/)
  if (!productsSectionMatch) return []
  const body = productsSectionMatch[1]
  // Match objects like { id: 1, name: ' Apples', price: 50, category: 'Fruits', image: Apples }
  const objRegex = /\{\s*id:\s*[^,]+,\s*name:\s*'([^']*)'\s*,\s*price:\s*([^,]+),\s*category:\s*'([^']*)'\s*,\s*image:\s*(\w+)\s*\}/g
  const results = []
  let mo
  while ((mo = objRegex.exec(body)) !== null) {
    const name = (mo[1] || '').trim()
    const price = Number(mo[2]) || 0
    const category = (mo[3] || '').trim()
    const imageVar = mo[4]
    const file = varToFile.get(imageVar) || ''
    // Build a backend-served URL path for the asset: /static/assets/<filename>
    const image = file ? `/static/assets/${file}` : ''
    results.push({ name, price, category, image, stock: 100 })
  }
  return results
}

function parseGroups(source) {
  const importRegex = /import\s+(\w+)\s+from\s+['"]\.\.\/assets\/(.+?)['"]/g
  const varToFile = new Map()
  let m
  while ((m = importRegex.exec(source)) !== null) {
    varToFile.set(m[1], m[2])
  }
  const groupsMatch = source.match(/export\s+const\s+groceryData\s*=\s*\[([\s\S]*?)\];?/)
  if (!groupsMatch) return []
  const body = groupsMatch[1]
  // Roughly match group name and its items with image var
  const groupRegex = /name:\s*"([^"]+)"[\s\S]*?items:\s*\[([\s\S]*?)\]/g
  const itemRegex = /\{\s*id:\s*[^,]+,\s*name:\s*"([^"]+)",\s*price:\s*([^,]+),\s*image:\s*(\w+)[^}]*\}/g
  const results = []
  let g
  while ((g = groupRegex.exec(body)) !== null) {
    const groupName = (g[1] || '').trim()
    const itemsBlock = g[2] || ''
    let it
    while ((it = itemRegex.exec(itemsBlock)) !== null) {
      const name = (it[1] || '').trim()
      const price = Number(it[2]) || 0
      const imageVar = it[3]
      const file = varToFile.get(imageVar) || ''
      const image = file ? `/static/assets/${file}` : ''
      results.push({ name, price, category: groupName, image, stock: 100 })
    }
  }
  return results
}

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
  const srcProducts = readIfExists(TRY_PRODUCTS)
  const srcGroups = readIfExists(TRY_GROUPS)
  const itemsA = srcProducts ? parseProducts(srcProducts) : []
  const itemsB = srcGroups ? parseGroups(srcGroups) : []
  // Merge and dedupe by name|category
  const combined = [...itemsA, ...itemsB]
  const deduped = combined.filter((p, i, arr) => {
    const key = `${(p.name||'').toLowerCase()}|${(p.category||'').toLowerCase()}`
    return arr.findIndex(x => `${(x.name||'').toLowerCase()}|${(x.category||'').toLowerCase()}` === key) === i
  })
  if (!deduped.length) {
    console.error('No products parsed from assets')
    process.exit(1)
  }
  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
  await Product.deleteMany({})
  await Image.deleteMany({})
  // Create image docs first
  const images = await Image.insertMany(deduped.map(p => ({
    name: p.name,
    filename: p.image.replace('/static/assets/', ''),
    url: p.image,
    source: 'assets'
  })))
  const imageMap = new Map(images.map(i => [(`${i.name}` + '|' + `${i.filename}`).toLowerCase(), i]))
  const productsToInsert = deduped.map(p => {
    const key = (`${p.name}` + '|' + `${p.image.replace('/static/assets/', '')}`).toLowerCase()
    const img = imageMap.get(key)
    return {
      name: p.name,
      description: '',
      price: p.price,
      image: img ? img.url : p.image,
      category: p.category,
      stock: p.stock,
      isFeatured: false,
      discountPercent: 0
    }
  })
  const created = await Product.insertMany(productsToInsert)
  console.log(`Inserted ${created.length} products and ${images.length} images from assets`) 
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })


