const { Schema, model } = require('mongoose')

const AddressSchema = new Schema(
  {
    label: String,
    line1: String,
    line2: String,
    postalCode: String,
    city: String,
    instructions: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
)

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: String,
    favoriteCategories: [String],
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
)

module.exports = model('User', UserSchema)
