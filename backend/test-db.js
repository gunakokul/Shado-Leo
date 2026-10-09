require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    const count = await prisma.user.count()
    console.log('MongoDB OK - Users:', count)
  } catch (error) {
    console.error('MongoDB ERROR:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()