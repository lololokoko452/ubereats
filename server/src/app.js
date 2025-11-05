require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const createError = require('http-errors')

const routes = require('./routes')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

app.use('/api', routes)

app.use((req, res, next) => {
  next(createError(404, `No route found for ${req.method} ${req.originalUrl}`))
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message =
    err.message || 'Une erreur est survenue, veuillez réessayer plus tard.'

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err)
  }

  res.status(status).json({
    status,
    message,
    details: err.details || undefined,
  })
})

module.exports = app
