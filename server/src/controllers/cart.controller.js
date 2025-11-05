const createError = require('http-errors')
const Cart = require('../models/Cart')

const normalizeKey = (restaurantSlug, itemName) =>
  `${restaurantSlug}::${(itemName || '').toLowerCase().trim()}`

const ensureCart = async userId => {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] })
  }
  return cart
}

const formatCart = cart => {
  const items = cart.items.map(item => {
    const lineTotal = item.price * item.quantity
    return {
      itemKey: item.itemKey,
      restaurantSlug: item.restaurantSlug,
      restaurantName: item.restaurantName,
      sectionTitle: item.sectionTitle || null,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      notes: item.notes || null,
      lineTotal: Number(lineTotal.toFixed(2)),
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    currency: cart.currency || 'EUR',
    subtotal: Number(subtotal.toFixed(2)),
    totalItems,
    updatedAt: cart.updatedAt,
  }
}

exports.getCart = async (req, res) => {
  const cart = await ensureCart(req.user.id)
  res.json(formatCart(cart))
}

exports.addItem = async (req, res, next) => {
  const { item = {}, quantity = 1 } = req.body || {}

  if (!item || !item.name || !item.restaurantSlug || !item.restaurantName) {
    return next(createError(400, 'Les informations article et restaurant sont requises.'))
  }

  const qty = Math.floor(Number(quantity) || 1)
  if (qty <= 0) {
    return next(createError(400, 'La quantité doit être positive.'))
  }

  const cart = await ensureCart(req.user.id)
  const itemKey = normalizeKey(item.restaurantSlug, item.name)
  const existing = cart.items.find(entry => entry.itemKey === itemKey)

  if (existing) {
    existing.quantity += qty
  } else {
    cart.items.push({
      itemKey,
      restaurantSlug: item.restaurantSlug,
      restaurantName: item.restaurantName,
      sectionTitle: item.sectionTitle || null,
      name: item.name,
      description: item.description || '',
      price: Math.max(0, Number(item.price) || 0),
      quantity: qty,
      image: item.image || '',
      notes: item.notes || '',
    })
  }

  await cart.save()

  res.status(existing ? 200 : 201).json(formatCart(cart))
}

exports.updateItem = async (req, res, next) => {
  const { itemKey: rawKey } = req.params
  const { quantity } = req.body || {}

  if (typeof quantity === 'undefined') {
    return next(createError(400, 'La quantité est requise.'))
  }

  const qty = Math.floor(Number(quantity))
  if (Number.isNaN(qty)) {
    return next(createError(400, 'La quantité doit être un nombre.'))
  }

  const cart = await ensureCart(req.user.id)
  const itemKey = decodeURIComponent(rawKey)
  const existing = cart.items.find(entry => entry.itemKey === itemKey)

  if (!existing) {
    return next(createError(404, 'Article introuvable dans le panier.'))
  }

  if (qty <= 0) {
    cart.items = cart.items.filter(entry => entry.itemKey !== itemKey)
  } else {
    existing.quantity = qty
  }

  await cart.save()
  res.json(formatCart(cart))
}

exports.removeItem = async (req, res, next) => {
  const { itemKey: rawKey } = req.params
  const cart = await ensureCart(req.user.id)
  const itemKey = decodeURIComponent(rawKey)
  const beforeCount = cart.items.length

  cart.items = cart.items.filter(entry => entry.itemKey !== itemKey)

  if (cart.items.length === beforeCount) {
    return next(createError(404, 'Article introuvable dans le panier.'))
  }

  await cart.save()
  res.status(200).json(formatCart(cart))
}

exports.clearCart = async (req, res) => {
  const cart = await ensureCart(req.user.id)
  cart.items = []
  await cart.save()
  res.status(200).json(formatCart(cart))
}
