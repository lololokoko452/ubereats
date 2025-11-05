const express = require('express')
const restaurantController = require('../controllers/restaurant.controller')

const router = express.Router()

router.get('/', restaurantController.list)
router.get('/:slug', restaurantController.getOne)
router.get('/:slug/similar', restaurantController.getSimilar)

module.exports = router
