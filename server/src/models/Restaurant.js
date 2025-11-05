const { Schema, model } = require('mongoose')
const slugify = require('slugify')

const CoordinatesSchema = new Schema(
  {
    lat: Number,
    lng: Number,
  },
  { _id: false }
)

const LocationSchema = new Schema(
  {
    address: String,
    postalCode: String,
    city: String,
    country: { type: String, default: 'France' },
    coordinates: CoordinatesSchema,
  },
  { _id: false }
)

const ContactSchema = new Schema(
  {
    phone: String,
    website: String,
    instagram: String,
  },
  { _id: false }
)

const MenuItemSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    tags: [String],
    spicy: Boolean,
    vegetarian: Boolean,
    vegan: Boolean,
  },
  { _id: false }
)

const MenuSectionSchema = new Schema(
  {
    title: String,
    subtitle: String,
    items: [MenuItemSchema],
  },
  { _id: false }
)

const RestaurantSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: String,
    shortDescription: String,
    description: String,
    heroImage: String,
    logoImage: String,
    rating: Number,
    reviewCount: Number,
    deliveryFee: Number,
    deliveryFeeDescription: String,
    deliveryTimeMin: Number,
    deliveryTimeMax: Number,
    priceRange: String,
    highlights: [String],
    tags: [String],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    location: LocationSchema,
    contact: ContactSchema,
    promo: {
      text: String,
      accentColor: String,
      expiresAt: Date,
    },
    collections: [String],
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    menuSections: [MenuSectionSchema],
    allergens: [String],
    deliveryNotes: [String],
  },
  { timestamps: true }
)

RestaurantSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

module.exports = model('Restaurant', RestaurantSchema)
