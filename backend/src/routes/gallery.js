const express = require('express')
const router = express.Router()
const { connectWithRetry, isDatabaseUnavailable, prisma } = require('../config/database')

function withDatabaseTimeout(query, timeoutMs = 5000) {
  let timeout
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error('Database request timed out while waiting for MongoDB.')), timeoutMs)
  })
  return Promise.race([query, timeoutPromise]).finally(() => clearTimeout(timeout))
}

router.get('/portfolio', async (req, res) => {
  try {
    await connectWithRetry()
    const category = String(req.query.category || '').trim()
    const items = await withDatabaseTimeout(prisma.portfolio.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    }))

    return res.json(Array.isArray(items) ? items : [])
  } catch (error) {
    console.error('Public portfolio fetch failed.')
    console.error(error?.stack || error)

    if (isDatabaseUnavailable(error) || error?.message?.includes('Database request timed out')) {
      res.set('X-Portfolio-Source', 'fallback')
      return res.json([])
    }

    return res.status(500).json({ message: 'Unable to load portfolio items.' })
  }
})

// Public gallery listing (filtering, categories can be added)
router.get('/', async (req, res) => {
  const items = await prisma.media.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  res.json(items.map((i) => ({
    id: i.id,
    title: i.title,
    thumbnailUrl: i.thumbnailUrl || i.url,
    url: i.url,
    type: i.type,
    category: i.category ? { id: i.category.id, name: i.category.name, slug: i.category.slug } : null,
  })))
})

module.exports = router
