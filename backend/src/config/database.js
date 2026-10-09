const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const maxConnectionAttempts = Number(process.env.DATABASE_CONNECTION_RETRIES || 3)
const retryDelayMs = Number(process.env.DATABASE_RETRY_DELAY_MS || 1000)
let connectionPromise = null

function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function isDatabaseUnavailable(error) {
  const message = String(error?.message || '')
  return [
    'P1000',
    'P1001',
    'P1002',
    'P1008',
    'P1017',
    'P2010',
    'Server selection timeout',
    'server selection timeout',
    'MongoServerSelectionError',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'connection closed',
    'connection reset',
  ].some((indicator) => error?.code === indicator || message.includes(indicator))
}

async function connectWithRetry() {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      for (let attempt = 1; attempt <= maxConnectionAttempts; attempt += 1) {
        try {
          await prisma.$connect()
          console.log(`Database connection established on attempt ${attempt}.`)
          return
        } catch (error) {
          console.error(`Database connection attempt ${attempt}/${maxConnectionAttempts} failed.`)
          console.error(error?.stack || error)

          if (attempt === maxConnectionAttempts) throw error
          await wait(retryDelayMs * attempt)
        }
      }
    })().catch((error) => {
      connectionPromise = null
      throw error
    })
  }

  return connectionPromise
}

async function disconnectDatabase() {
  connectionPromise = null
  await prisma.$disconnect()
}

module.exports = {
  prisma,
  connectWithRetry,
  disconnectDatabase,
  isDatabaseUnavailable,
}