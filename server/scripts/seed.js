/* eslint-disable no-console */
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('../src/models/User')
const Category = require('../src/models/Category')
const Restaurant = require('../src/models/Restaurant')
const Cart = require('../src/models/Cart')

const userSeeds = require('../seeds/users.json')
const categorySeeds = require('../seeds/categories.json')
const restaurantSeeds = require('../seeds/restaurants.json')

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ubereats_demo'

async function hashPasswords(users) {
  return Promise.all(
    users.map(async user => {
      const prepared = { ...user }
      if (prepared.password) {
        prepared.passwordHash = await bcrypt.hash(prepared.password, 10)
        delete prepared.password
      }
      return prepared
    })
  )
}

function buildRestaurantsPayload(restaurants, categoryMap) {
  return restaurants.map(restaurant => {
    const payload = { ...restaurant }
    payload.categories = (restaurant.categorySlugs || [])
      .map(slug => categoryMap[slug])
      .filter(Boolean)

    delete payload.categorySlugs
    return payload
  })
}

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  console.log('Clearing collections...')
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Restaurant.deleteMany({}),
    Cart.deleteMany({}),
  ])

  console.log('Inserting categories...')
  const categories = await Category.insertMany(categorySeeds)
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.slug] = category.id
    return acc
  }, {})

  console.log('Inserting restaurants...')
  const restaurantsPayload = buildRestaurantsPayload(
    restaurantSeeds,
    categoryMap
  )
  await Restaurant.insertMany(restaurantsPayload)

  console.log('Inserting users...')
  const usersPayload = await hashPasswords(userSeeds)
  await User.insertMany(usersPayload)

  console.log('Seed completed successfully!')
}

seed()
  .catch(error => {
    console.error('Seed failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
    console.log('MongoDB connection closed')
  })
