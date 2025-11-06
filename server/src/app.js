require('dotenv').config()
require('express-async-errors')

const { Sentry } = require('./config/sentry')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const createError = require('http-errors')
const path = require('node:path')
const fs = require('node:fs')

const routes = require('./routes')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const staticDir = path.join(__dirname, '..', 'public')
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// routes
app.use('/api', routes);

// 404
app.use((req, res, next) => {
  next(createError(404, `No route found for ${req.method} ${req.originalUrl}`));
});

// Sentry (v8) - doit être ici
app.use(Sentry.expressErrorHandler());

// ton handler custom en dernier
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Une erreur est survenue, veuillez réessayer plus tard.';
  if (status >= 500) console.error(err);
  res.status(status).json({ status, message, details: err.details || undefined });
});


module.exports = app
