import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'

dotenv.config()

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'

const sample = [
  { name: 'Apples', price: 50, category: 'Fruits', image: '', stock: 100, isFeatured: true },
  { name: 'Bananas', price: 40, category: 'Fruits', image: '', stock: 120 },
  { name: 'Organic Spinach', price: 75, category: 'Vegetables', image: '', stock: 80 },
  { name: 'Milk', price: 60, category: 'Dairy', image: '', stock: 60 },
  { name: 'Coffee', price: 150, category: 'Beverages', image: '', stock: 50 }
]

async function run() {
  await mongoose.connect(uri)
  console.log('Connected. Seeding products...')
  await Product.deleteMany({})
  await Product.insertMany(sample)
  console.log('Seeded products:', sample.length)
  await mongoose.disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })


