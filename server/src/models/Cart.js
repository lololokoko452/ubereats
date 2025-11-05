const { Schema, model } = require('mongoose')

const CartItemSchema = new Schema(
  {
    itemKey: { type: String, required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    restaurantSlug: { type: String, required: true },
    restaurantName: { type: String, required: true },
    sectionTitle: String,
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    image: String,
    notes: String,
  },
  { _id: false }
)

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    currency: { type: String, default: 'EUR' },
  },
  { timestamps: true }
)

CartSchema.index({ user: 1 }, { unique: true })

module.exports = model('Cart', CartSchema)
