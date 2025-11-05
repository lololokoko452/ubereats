const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/User')

function buildAuthResponse(user, token) {
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      addresses: user.addresses,
      favoriteCategories: user.favoriteCategories,
    },
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    throw createError(400, 'Email et mot de passe requis.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    throw createError(401, 'Identifiants invalides.')
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    throw createError(401, 'Identifiants invalides.')
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  )

  res.json(buildAuthResponse(user, token))
}
