const express = require('express')
const homeController = require('../controllers/home.controller')

const router = express.Router()

router.get('/', homeController.getHome)
router.get('/search-suggestions', homeController.getSearchSuggestions)

module.exports = router
