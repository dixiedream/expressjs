import mongoose from 'mongoose'
import { logger } from './logger.js'

const { NODE_ENV, MONGO_CONNECTION } = process.env

const mongoConnection = MONGO_CONNECTION ?? 'mongodb://db:27017/expressmongo'

const autoIndex = NODE_ENV === 'development'

mongoose.set('strictQuery', false)

// Db connection
export default async () => {
  try {
    await mongoose.connect(mongoConnection, { autoIndex })
    if (NODE_ENV === 'development') {
      logger.info('DB_CONNECTED', { dbConnection: mongoConnection })
    } else {
      logger.info('DB_CONNECTED')
    }
  } catch (e: any) {
    logger.error('DB_CONNECTION_FAILED', e)
  }
}
