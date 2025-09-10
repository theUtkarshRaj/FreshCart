import { Router } from 'express'
import Image from '../models/Image.js'
import { authRequired, adminOnly } from '../middleware/auth.js'
import mongoose from 'mongoose'
import path from 'path'
import mime from 'mime-types'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const list = await Image.find().sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
})

// Create image doc for asset-based entries
router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { name, filename, url, source } = req.body
    const img = await Image.create({ name, filename, url, source: source || 'assets' })
    res.status(201).json(img)
  } catch (e) { next(e) }
})

// Upload binary to GridFS and create image doc
router.post('/upload', authRequired, adminOnly, async (req, res) => {
  try {
    const db = mongoose.connection.db
    const bucket = new mongoose.mongo.GridFSBucket(db)
    const chunks = []
    req.on('data', (d) => chunks.push(d))
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks)
      const filename = req.headers['x-filename'] || `upload_${Date.now()}`
      const uploadStream = bucket.openUploadStream(filename)
      uploadStream.end(buffer, async () => {
        const fileId = uploadStream.id
        const img = await Image.create({ name: filename, filename, gridFsId: fileId, source: 'upload' })
        res.status(201).json({ id: img._id, fileId })
      })
    })
  } catch (e) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

export default router

// Stream image binary from GridFS by file id
router.get('/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db
    const bucket = new mongoose.mongo.GridFSBucket(db)
    const fileId = new mongoose.Types.ObjectId(req.params.id)
    // Try to get file metadata to set content-type
    const files = db.collection('fs.files')
    const fileDoc = await files.findOne({ _id: fileId })
    const contentType = fileDoc?.contentType || mime.lookup(path.extname(fileDoc?.filename || '')) || 'application/octet-stream'
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.set('Content-Type', contentType)
    const stream = bucket.openDownloadStream(fileId)
    stream.on('error', () => res.status(404).end())
    stream.pipe(res)
  } catch {
    res.status(400).json({ message: 'Invalid image id' })
  }
})


