const express = require('express')
const { Sentry } = require('../config/sentry')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

router.get('/error', () => {
  throw new Error('Test error')
})

router.get('/slow', async (req, res, next) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    res.json({
      status: 'slow response',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/message', (req, res) => {
  const { message = 'Test message' } = req.body || {}

  Sentry.captureMessage(String(message), 'info')

  res.json({
    status: 'message recorded',
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
