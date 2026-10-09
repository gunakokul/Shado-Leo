require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes/auth')
const galleryRoutes = require('./routes/gallery')
const contactRoutes = require('./routes/contact')
const paymentRoutes = require('./routes/payments')
const adminRoutes = require('./routes/admin')
const { connectWithRetry, prisma } = require('./config/database')
const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/vault', authRoutes)
app.use('/gallery', galleryRoutes)
app.use('/contact', contactRoutes)
app.use('/payments', paymentRoutes)
app.use('/admin', adminRoutes)
app.use('/api', galleryRoutes)
app.use('/api', adminRoutes)
app.use('/api/admin', adminRoutes)

app.get('/packages', async (req, res) => {
	const packages = await prisma.servicePackage.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
	res.json(packages)
})

app.get('/', (req, res) => res.json({ ok: true }))

app.use((error, req, res, next) => {
	console.error('API error:', error)

	if (res.headersSent) return next(error)

	const databaseUnavailable = error?.code === 'P2010' || error?.message?.includes('Server selection timeout')
	return res.status(databaseUnavailable ? 503 : 500).json({
		message: databaseUnavailable
			? 'Database is temporarily unavailable. Please try again shortly.'
			: 'Internal server error.',
	})
})

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
	console.log('Server running on', port)
	connectWithRetry().catch((error) => {
		console.error('Initial database connection failed after retries; continuing in degraded mode.')
		console.error(error?.stack || error)
	})
})

server.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		console.error(`Port ${port} is already in use.`)
		process.exitCode = 1
		return
	}

	throw error
})
