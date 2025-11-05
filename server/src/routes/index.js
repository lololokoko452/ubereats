const express = require('express')

const authRoutes = require('./auth.routes')
const homeRoutes = require('./home.routes')
const restaurantRoutes = require('./restaurants.routes')
const categoryRoutes = require('./categories.routes')
const cartRoutes = require('./cart.routes')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/home', homeRoutes)
router.use('/restaurants', restaurantRoutes)
router.use('/categories', categoryRoutes)
router.use('/cart', cartRoutes)

module.exports = router
