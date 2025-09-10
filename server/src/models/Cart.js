import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: String,
  price: Number,
  image: String,
  category: String,
  quantity: { type: Number, default: 1 }
}, { _id: false })

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: { type: [cartItemSchema], default: [] }
}, { timestamps: true })

export default mongoose.model('Cart', cartSchema)


