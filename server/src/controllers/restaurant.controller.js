const createError = require('http-errors')
const Category = require('../models/Category')
const Restaurant = require('../models/Restaurant')

const toCategoryBadge = category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
})

const toRestaurantCard = restaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  slug: restaurant.slug,
  tagline: restaurant.tagline,
  shortDescription: restaurant.shortDescription,
  heroImage: restaurant.heroImage,
  logoImage: restaurant.logoImage,
  rating: restaurant.rating,
  reviewCount: restaurant.reviewCount,
  deliveryFee: restaurant.deliveryFee,
  deliveryFeeDescription: restaurant.deliveryFeeDescription,
  deliveryTimeMin: restaurant.deliveryTimeMin,
  deliveryTimeMax: restaurant.deliveryTimeMax,
  priceRange: restaurant.priceRange,
  tags: restaurant.tags,
  highlights: restaurant.highlights,
  promo: restaurant.promo?.text || null,
  collections: restaurant.collections,
  categories: (restaurant.categories || []).map(toCategoryBadge),
})

const toRestaurantDetail = restaurant => ({
  ...toRestaurantCard(restaurant),
  description: restaurant.description,
  location: restaurant.location,
  contact: restaurant.contact,
  menuSections: restaurant.menuSections,
  allergens: restaurant.allergens,
  deliveryNotes: restaurant.deliveryNotes,
})

exports.list = async (req, res) => {
  const { search, category, city, limit = 30 } = req.query

  const filters = {}
  if (city) {
    filters['location.city'] = city
  }

  let categoryFilter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category })
    if (!categoryDoc) {
      return res.json({ items: [], total: 0 })
    }
    categoryFilter = categoryDoc.slug
    filters.categories = categoryDoc.id
  }

  const queryConditions = []
  if (search) {
    const normalized = search.trim()
    queryConditions.push(
      { name: { $regex: normalized, $options: 'i' } },
      { tagline: { $regex: normalized, $options: 'i' } },
      { tags: { $regex: normalized, $options: 'i' } },
      { collections: { $regex: normalized, $options: 'i' } }
    )
  }

  const query = Restaurant.find(
    queryConditions.length ? { ...filters, $or: queryConditions } : filters
  )

  const restaurants = await query
    .populate('categories')
    .sort({ isFeatured: -1, rating: -1 })
    .limit(Number(limit) || 30)

  res.json({
    total: restaurants.length,
    category: categoryFilter || null,
    items: restaurants.map(toRestaurantCard),
  })
}

exports.getOne = async (req, res) => {
  const { slug } = req.params
  const restaurant = await Restaurant.findOne({ slug }).populate('categories')

  if (!restaurant) {
    throw createError(404, 'Restaurant introuvable.')
  }

  const similar = await Restaurant.find({
    _id: { $ne: restaurant.id },
    categories: { $in: restaurant.categories.map(cat => cat.id) },
  })
    .limit(6)
    .populate('categories')

  res.json({
    restaurant: toRestaurantDetail(restaurant),
    similar: similar.map(toRestaurantCard),
  })
}

exports.getSimilar = async (req, res) => {
  const { slug } = req.params
  const restaurant = await Restaurant.findOne({ slug }).populate('categories')

  if (!restaurant) {
    throw createError(404, 'Restaurant introuvable.')
  }

  const similar = await Restaurant.find({
    _id: { $ne: restaurant.id },
    categories: { $in: restaurant.categories.map(cat => cat.id) },
  })
    .limit(6)
    .populate('categories')

  res.json({
    items: similar.map(toRestaurantCard),
  })
}
