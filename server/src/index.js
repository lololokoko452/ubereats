const mongoose = require('mongoose')
const app = require('./app')

const PORT = process.env.PORT || 4000
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ubereats_demo'

mongoose.set('strictQuery', false)

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    // eslint-disable-next-line no-console
    console.log('✅ Connected to MongoDB')

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 API listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error', error)
    process.exit(1)
  }
}

bootstrap()
