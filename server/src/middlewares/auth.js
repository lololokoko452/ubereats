const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

module.exports = async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    return next(createError(401, 'Authentification requise.'))
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.sub)

    if (!user) {
      throw createError(401, 'Utilisateur introuvable.')
    }

    req.user = user
    req.auth = payload
    return next()
  } catch (error) {
    if (error.status) {
      return next(error)
    }
    return next(createError(401, 'Session invalide ou expirée.'))
  }
}
