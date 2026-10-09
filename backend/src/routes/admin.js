const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
})
const localUploadDirectory = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(localUploadDirectory, { recursive: true })
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const publicApiOrigin = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 4000}`
const cloudinaryConfigured = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every((value) => value && !value.startsWith('your_'))

function uploadToCloudinary(file, folder, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(file.buffer)
  })
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/, '')

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    req.admin = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const admin = await prisma.user.findUnique({ where: { email } })
  if (!admin || admin.role !== 'admin') {
    return res.status(401).json({ message: 'Invalid admin credentials.' })
  }

  const bcrypt = require('bcryptjs')
  const passwordMatches = await bcrypt.compare(password, admin.password)
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid admin credentials.' })
  }

  const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token, user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } })
})

router.get('/me', requireAdmin, async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { email: req.admin.email } })
  if (!admin) return res.status(404).json({ error: 'Admin not found' })

  res.json({ user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } })
})

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [packages, bookings, categories, media, contacts, portfolio, vault] = await Promise.all([
      prisma.servicePackage.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.galleryCategory.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.portfolio.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.clientVault.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ])

    return res.json({
      packages: Array.isArray(packages) ? packages : [],
      bookings: Array.isArray(bookings) ? bookings : [],
      categories: Array.isArray(categories) ? categories : [],
      media: Array.isArray(media) ? media : [],
      contacts: Array.isArray(contacts) ? contacts : [],
      portfolio: Array.isArray(portfolio) ? portfolio : [],
      vault: Array.isArray(vault) ? vault : [],
    })
  } catch (error) {
    console.error('Admin dashboard data fetch failed:', error)
    return res.status(500).json({
      message: error?.message || 'Unable to load admin dashboard data.',
    })
  }
})

router.get('/portfolio', requireAdmin, async (req, res) => {
  try {
    const category = String(req.query.category || '').trim()
    const items = await prisma.portfolio.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return res.json(Array.isArray(items) ? items : [])
  } catch (error) {
    console.error('Portfolio fetch failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to load portfolio items.' })
  }
})

router.post('/portfolio', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, category } = req.body || {}
    const files = req.files || []
    if (!title || !category || !files.length) {
      return res.status(400).json({ message: 'Title, category, and image file are required.' })
    }
    if (!cloudinaryConfigured) {
      return res.status(503).json({ message: 'Cloudinary credentials are required for portfolio uploads.' })
    }

    const results = await Promise.all(files.map((file) => uploadToCloudinary(file, 'shadow-leo/portfolio', 'image')))

    const item = await prisma.portfolio.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        category: String(category).trim(),
        imageUrls: results.map((result) => result.secure_url),
        cloudinaryPublicIds: results.map((result) => result.public_id),
        imageUrl: results[0].secure_url,
        cloudinaryPublicId: results[0].public_id,
      },
    })
    return res.status(201).json(item)
  } catch (error) {
    console.error('Portfolio create failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to create portfolio item.' })
  }
})

router.put('/portfolio/:id', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const existing = await prisma.portfolio.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Portfolio item not found.' })

    const { title, description, category } = req.body || {}
    const data = {
      title: title === undefined ? existing.title : String(title).trim(),
      description: description === undefined ? existing.description : String(description).trim() || null,
      category: category === undefined ? existing.category : String(category).trim(),
      updatedAt: new Date(),
    }

    const files = req.files || []
    if (files.length) {
      if (!cloudinaryConfigured) {
        return res.status(503).json({ message: 'Cloudinary credentials are required to replace portfolio images.' })
      }
      const results = await Promise.all(files.map((file) => uploadToCloudinary(file, 'shadow-leo/portfolio', 'image')))
      data.imageUrls = results.map((result) => result.secure_url)
      data.cloudinaryPublicIds = results.map((result) => result.public_id)
      data.imageUrl = results[0].secure_url
      data.cloudinaryPublicId = results[0].public_id
      const existingPublicIds = existing.cloudinaryPublicIds?.length
        ? existing.cloudinaryPublicIds
        : (existing.cloudinaryPublicId ? [existing.cloudinaryPublicId] : [])
      await Promise.all(existingPublicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' })))
    }

    return res.json(await prisma.portfolio.update({ where: { id: req.params.id }, data }))
  } catch (error) {
    console.error('Portfolio update failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to update portfolio item.' })
  }
})

router.delete('/portfolio/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.portfolio.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Portfolio item not found.' })
    if (cloudinaryConfigured) {
      const publicIds = existing.cloudinaryPublicIds?.length
        ? existing.cloudinaryPublicIds
        : (existing.cloudinaryPublicId ? [existing.cloudinaryPublicId] : [])
      await Promise.all(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' })))
    }
    await prisma.portfolio.delete({ where: { id: req.params.id } })
    return res.json({ ok: true, id: req.params.id })
  } catch (error) {
    console.error('Portfolio delete failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to delete portfolio item.' })
  }
})

router.get('/vault', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 25, 1), 100)
    const category = String(req.query.category || '').trim()
    const where = category ? { category } : undefined
    const [items, total] = await Promise.all([
      prisma.clientVault.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.clientVault.count({ where }),
    ])
    return res.json({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    console.error('Vault fetch failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to load vault documents.' })
  }
})

router.post('/vault', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { clientName, clientEmail, title, category, accessCode } = req.body || {}
    if (!clientName || !clientEmail || !title || !category || !req.file) {
      return res.status(400).json({ message: 'Client name, email, title, category, and file are required.' })
    }
    if (!cloudinaryConfigured) {
      return res.status(503).json({ message: 'Cloudinary credentials are required for vault uploads.' })
    }
    const result = await uploadToCloudinary(req.file, 'shadow-leo/vault', 'auto')
    const document = await prisma.clientVault.create({
      data: {
        clientName: String(clientName).trim(),
        clientEmail: String(clientEmail).trim().toLowerCase(),
        title: String(title).trim(),
        fileUrl: result.secure_url,
        publicId: result.public_id,
        category: String(category).trim(),
        accessCode: accessCode ? String(accessCode).trim() : null,
      },
    })
    return res.status(201).json(document)
  } catch (error) {
    console.error('Vault create failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to create vault document.' })
  }
})

router.put('/vault/:id', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const existing = await prisma.clientVault.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Vault document not found.' })
    const { clientName, clientEmail, title, category, accessCode } = req.body || {}
    const data = {
      clientName: clientName === undefined ? existing.clientName : String(clientName).trim(),
      clientEmail: clientEmail === undefined ? existing.clientEmail : String(clientEmail).trim().toLowerCase(),
      title: title === undefined ? existing.title : String(title).trim(),
      category: category === undefined ? existing.category : String(category).trim(),
      accessCode: accessCode === undefined ? existing.accessCode : String(accessCode).trim() || null,
    }
    if (req.file) {
      if (!cloudinaryConfigured) return res.status(503).json({ message: 'Cloudinary credentials are required to replace vault files.' })
      const result = await uploadToCloudinary(req.file, 'shadow-leo/vault', 'auto')
      data.fileUrl = result.secure_url
      data.publicId = result.public_id
      if (existing.publicId) await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'auto' })
    }
    return res.json(await prisma.clientVault.update({ where: { id: req.params.id }, data }))
  } catch (error) {
    console.error('Vault update failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to update vault document.' })
  }
})

router.delete('/vault/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.clientVault.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Vault document not found.' })
    if (existing.publicId && cloudinaryConfigured) {
      await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'auto' })
    }
    await prisma.clientVault.delete({ where: { id: req.params.id } })
    return res.json({ ok: true, id: req.params.id })
  } catch (error) {
    console.error('Vault delete failed:', error)
    return res.status(500).json({ message: error?.message || 'Unable to delete vault document.' })
  }
})

router.get('/packages', requireAdmin, async (req, res) => {
  const packages = await prisma.servicePackage.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(packages)
})

router.post('/packages', requireAdmin, async (req, res) => {
  const { name, category, description, price, featured, isActive } = req.body || {}

  if (!name || !category) {
    return res.status(400).json({ message: 'Package name and category are required.' })
  }

  const record = await prisma.servicePackage.create({
    data: {
      name,
      category,
      description: description || '',
      price: Number(price || 0),
      featured: Boolean(featured),
      isActive: isActive !== false,
    },
  })

  res.status(201).json(record)
})

router.put('/packages/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { name, category, description, price, featured, isActive } = req.body || {}

  const record = await prisma.servicePackage.update({
    where: { id },
    data: {
      name,
      category,
      description,
      price: price !== undefined ? Number(price) : undefined,
      featured,
      isActive,
    },
  })

  res.json(record)
})

router.delete('/packages/:id', requireAdmin, async (req, res) => {
  await prisma.servicePackage.delete({ where: { id: req.params.id } })
  res.json({ ok: true, id: req.params.id })
})

router.get('/bookings', requireAdmin, async (req, res) => {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(bookings)
})

router.put('/bookings/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {}
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status.' })
  }
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
  })

  res.json(booking)
})

router.put('/bookings/:id', requireAdmin, async (req, res) => {
  const allowedFields = ['clientName', 'clientEmail', 'phone', 'location', 'status', 'depositPaid', 'notes', 'packageJson']
  const data = Object.fromEntries(
    allowedFields
      .filter((field) => req.body?.[field] !== undefined)
      .map((field) => [field, field === 'depositPaid' ? Number(req.body[field]) : req.body[field]]),
  )
  if (req.body?.date !== undefined) data.date = new Date(req.body.date)
  if (data.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(data.status)) {
    return res.status(400).json({ message: 'Invalid booking status.' })
  }
  res.json(await prisma.booking.update({ where: { id: req.params.id }, data }))
})

router.delete('/bookings/:id', requireAdmin, async (req, res) => {
  await prisma.booking.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

router.get('/gallery/categories', requireAdmin, async (req, res) => {
  const categories = await prisma.galleryCategory.findMany({
    include: { media: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(categories)
})

router.post('/gallery/categories', requireAdmin, async (req, res) => {
  const { name, description } = req.body || {}

  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const category = await prisma.galleryCategory.create({
    data: {
      name,
      slug,
      description: description || '',
    },
  })

  res.status(201).json(category)
})

router.put('/gallery/categories/:id', requireAdmin, async (req, res) => {
  const { name, description } = req.body || {}
  const category = await prisma.galleryCategory.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : undefined,
    },
  })

  res.json(category)
})

router.delete('/gallery/categories/:id', requireAdmin, async (req, res) => {
  await prisma.media.updateMany({ where: { categoryId: req.params.id }, data: { categoryId: null } })
  await prisma.galleryCategory.delete({ where: { id: req.params.id } })
  res.json({ ok: true, id: req.params.id })
})

router.post('/gallery/upload', requireAdmin, upload.single('file'), async (req, res) => {
  const { title, type, categoryId } = req.body || {}
  const file = req.file

  if (!file || !title || !type) {
    return res.status(400).json({ message: 'Title, type, and file are required.' })
  }

  const extension = path.extname(file.originalname) || (type === 'video' ? '.mp4' : '.jpg')
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension.toLowerCase()}`
  let url
  let thumbnailUrl

  if (cloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'shadow-leo', resource_type: type === 'video' ? 'video' : 'image' },
          (error, uploadResult) => (error ? reject(error) : resolve(uploadResult)),
        )
        stream.end(file.buffer)
      })
      url = result.secure_url
      thumbnailUrl = result.thumbnail_url || result.secure_url
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage:', error)
    }
  }

  if (!url) {
    await fs.promises.writeFile(path.join(localUploadDirectory, fileName), file.buffer)
    url = `${publicApiOrigin}/uploads/${fileName}`
    thumbnailUrl = url
  }

  const media = await prisma.media.create({
    data: {
      title,
      type,
      url,
      thumbnailUrl,
      categoryId: categoryId || null,
    },
    include: { category: true },
  })

  res.status(201).json(media)
})

router.get('/gallery/media', requireAdmin, async (req, res) => {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  res.json(media)
})

router.delete('/gallery/media/:id', requireAdmin, async (req, res) => {
  const existing = await prisma.media.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ message: 'Media item not found.' })

  const media = await prisma.media.delete({ where: { id: req.params.id } })
  if (media.url.startsWith(`${publicApiOrigin}/uploads/`)) {
    await fs.promises.unlink(path.join(localUploadDirectory, path.basename(media.url))).catch(() => {})
  }
  res.json({ ok: true, id: req.params.id })
})

router.put('/gallery/media/:id', requireAdmin, upload.single('file'), async (req, res) => {
  const existing = await prisma.media.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ message: 'Media item not found.' })

  const { title, type, categoryId } = req.body || {}
  const data = {
    title: title || existing.title,
    type: type || existing.type,
    categoryId: categoryId === undefined ? existing.categoryId : categoryId || null,
  }

  if (req.file) {
    const extension = path.extname(req.file.originalname) || (data.type === 'video' ? '.mp4' : '.jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension.toLowerCase()}`
    await fs.promises.writeFile(path.join(localUploadDirectory, fileName), req.file.buffer)
    data.url = `${publicApiOrigin}/uploads/${fileName}`
    data.thumbnailUrl = data.url
    if (existing.url.startsWith(`${publicApiOrigin}/uploads/`)) {
      await fs.promises.unlink(path.join(localUploadDirectory, path.basename(existing.url))).catch(() => {})
    }
  }

  const media = await prisma.media.update({ where: { id: req.params.id }, data, include: { category: true } })
  res.json(media)
})

router.get('/contacts', requireAdmin, async (req, res) => {
  res.json(await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }))
})

router.put('/contacts/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {}
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid contact status.' })
  }
  res.json(await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status } }))
})

router.delete('/contacts/:id', requireAdmin, async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } })
  res.json({ ok: true, id: req.params.id })
})

// Short aliases for clients that use the documented /api/categories and /api/gallery/:id paths.
router.post('/categories', requireAdmin, async (req, res) => {
  const { name, description } = req.body || {}
  if (!name) return res.status(400).json({ message: 'Category name is required.' })
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  res.status(201).json(await prisma.galleryCategory.create({ data: { name, slug, description: description || '' } }))
})

router.put('/categories/:id', requireAdmin, async (req, res) => {
  const { name, description } = req.body || {}
  res.json(await prisma.galleryCategory.update({
    where: { id: req.params.id },
    data: { name, description, slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : undefined },
  }))
})

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  await prisma.media.updateMany({ where: { categoryId: req.params.id }, data: { categoryId: null } })
  await prisma.galleryCategory.delete({ where: { id: req.params.id } })
  res.json({ ok: true, id: req.params.id })
})

router.put('/gallery/:id', requireAdmin, async (req, res, next) => {
  req.url = `/gallery/media/${req.params.id}`
  return router.handle(req, res, next)
})

router.delete('/gallery/:id', requireAdmin, async (req, res, next) => {
  req.url = `/gallery/media/${req.params.id}`
  return router.handle(req, res, next)
})

module.exports = router
