const Category = require('../models/Category')
const Restaurant = require('../models/Restaurant')

const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Paris'

const toCategoryDto = category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: category.image,
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
})

const unique = array => Array.from(new Set(array.filter(Boolean)))

function buildSections(restaurants) {
  const sections = [
    {
      key: 'discover',
      title: 'À découvrir sur Uber Eats',
      subtitle: 'Les lieux incontournables du moment',
      items: restaurants
        .filter(r => r.collections?.includes('discover') || r.isFeatured)
        .slice(0, 12),
    },
    {
      key: 'nearby',
      title: 'Lieux susceptibles de vous intéresser',
      subtitle: 'Choisis en fonction de votre ville',
      items: restaurants
        .filter(r => r.collections?.includes('nearby') || r.isRecommended)
        .slice(0, 12),
    },
    {
      key: 'popular',
      title: 'Populaires près de chez vous',
      subtitle: 'Les favoris de votre quartier',
      items: restaurants
        .filter(r => r.collections?.includes('popular') || r.isPopular)
        .slice(0, 12),
    },
    {
      key: 'promo',
      title: 'Offres exclusives à ne pas manquer',
      subtitle: 'Promotions disponibles en ce moment',
      items: restaurants.filter(r => r.promo?.text).slice(0, 12),
    },
  ]

  return sections
    .map(section => ({
      ...section,
      items: section.items.map(toRestaurantCard),
    }))
    .filter(section => section.items.length)
}

function buildPromoBanners(restaurants) {
  return restaurants
    .filter(r => r.promo?.text)
    .slice(0, 6)
    .map(r => ({
      restaurantSlug: r.slug,
      title: r.promo.text,
      description: r.shortDescription || r.tagline,
      heroImage: r.heroImage,
      accent: r.promo.accentColor || '#1c1c1c',
    }))
}

function extractSearchData(restaurants) {
  const tags = restaurants.flatMap(r => r.tags || [])
  const cuisines = restaurants.flatMap(r => r.collections || [])
  const cities = restaurants.map(r => r.location?.city).filter(Boolean)

  return {
    trendingSearches: unique(tags)
      .slice(0, 10)
      .map(term => term.charAt(0).toUpperCase() + term.slice(1)),
    topCuisines: unique(cuisines).slice(0, 6),
    cities: unique(cities).slice(0, 5),
  }
}

exports.getHome = async (req, res) => {
  const city = req.query.city || DEFAULT_CITY

  const [categories, restaurantsInCity] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }),
    Restaurant.find({ 'location.city': city }),
  ])

  const restaurants =
    restaurantsInCity.length > 0
      ? restaurantsInCity
      : await Restaurant.find().limit(40)

  const heroCandidate =
    restaurants.find(r => r.collections?.includes('hero')) ||
    restaurants.find(r => r.isFeatured) ||
    restaurants[0]

  const sections = buildSections(restaurants)
  const promoBanners = buildPromoBanners(restaurants)
  const searchData = extractSearchData(restaurants)

  res.json({
    city,
    hero: heroCandidate ? toRestaurantCard(heroCandidate) : null,
    categories: categories.map(toCategoryDto),
    sections,
    promoBanners,
    search: searchData,
  })
}

exports.getSearchSuggestions = async (req, res) => {
  const { query = '' } = req.query
  const normalizedQuery = query.trim().toLowerCase()

  const restaurants = await Restaurant.find(
    normalizedQuery
      ? {
          $or: [
            { name: { $regex: normalizedQuery, $options: 'i' } },
            { tagline: { $regex: normalizedQuery, $options: 'i' } },
            { tags: { $regex: normalizedQuery, $options: 'i' } },
          ],
        }
      : {}
  ).limit(15)

  const tags = restaurants.flatMap(r => r.tags || [])
  const results = unique(
    [
      ...restaurants.map(r => r.name),
      ...tags,
      ...(normalizedQuery ? [normalizedQuery] : []),
    ].filter(Boolean)
  )

  res.json({
    query,
    suggestions: results.slice(0, 10),
  })
}
