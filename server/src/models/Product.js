import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  imageFilename: { type: String, default: '' },
  category: { type: String, index: true },
  stock: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)


