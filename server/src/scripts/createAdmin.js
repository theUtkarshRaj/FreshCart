import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@freshcart.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
  let user = await User.findOne({ email: ADMIN_EMAIL })
  if (!user) {
    user = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' })
    console.log('Admin user created:', ADMIN_EMAIL)
  } else if (user.role !== 'admin') {
    user.role = 'admin'
    await user.save()
    console.log('User promoted to admin:', ADMIN_EMAIL)
  } else {
    console.log('Admin already exists:', ADMIN_EMAIL)
  }
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })


