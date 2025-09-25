import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import url from 'url'

import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import orderRoutes from './routes/order.routes.js'
import userRoutes from './routes/user.routes.js'
import imageRoutes from './routes/image.routes.js'
import cartRoutes from './routes/cart.routes.js'

dotenv.config()

const app = express()
// app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean).length ? (process.env.CORS_ORIGIN || '').split(',') : '*', credentials: true }))
app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: '1mb' }))


// Optionally serve frontend assets (images) via backend for seeded image URLs
try {
  const __filename = url.fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const frontendAssets = path.resolve(__dirname, '../../frontend/src/assets')
  // Only enable if directory exists
  app.use('/static/assets', express.static(frontendAssets))
} catch {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart'
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected')
}).catch((err) => {
  console.error('MongoDB connection error:', err.message)
  process.exit(1)
})

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/images', imageRoutes)
app.use('/api/cart', cartRoutes)

app.use((req, res) => res.status(404).json({ message: 'Not Found' }))
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const DEFAULT_PORT = Number(process.env.PORT) || 5000
function startServer(startPort, attempt = 0) {
  const port = Number(startPort)
  const server = app.listen(port, () => {
    console.log(`API listening on port ${port}`)
  })
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const suggestion = `Port ${port} is in use. Change PORT in server/.env or kill the process.`
      console.error(suggestion)
      if (attempt === 0) {
        startServer(port + 1, attempt + 1)
      } else {
        process.exit(1)
      }
    } else {
      console.error('Server failed to start:', err)
      process.exit(1)
    }
  })
}
startServer(DEFAULT_PORT)


