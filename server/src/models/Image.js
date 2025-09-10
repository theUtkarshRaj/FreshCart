import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filename: { type: String, required: true },
  // For uploaded images we store GridFS file id to stream from /api/images/:id
  gridFsId: { type: mongoose.Schema.Types.ObjectId },
  // For asset-derived images we keep a static URL
  url: { type: String },
  source: { type: String, enum: ['assets', 'upload'], default: 'assets' }
}, { timestamps: true })

export default mongoose.model('Image', imageSchema)


