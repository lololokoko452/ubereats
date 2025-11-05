const { Schema, model } = require('mongoose')

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = model('Category', CategorySchema)
