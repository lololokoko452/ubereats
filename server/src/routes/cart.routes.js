const express = require('express')
const cartController = require('../controllers/cart.controller')
const requireAuth = require('../middlewares/auth')

const router = express.Router()

router.use(requireAuth)

router
  .route('/')
  .get(cartController.getCart)
  .delete(cartController.clearCart)

router.post('/items', cartController.addItem)
router.patch('/items/:itemKey', cartController.updateItem)
router.delete('/items/:itemKey', cartController.removeItem)

module.exports = router
