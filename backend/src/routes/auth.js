const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

// Vault login: { email, accessCode } or legacy { vaultId, pin }
router.post('/login', async (req, res) => {
  const { vaultId, pin, email, accessCode } = req.body || {}
  if (vaultId || pin) {
    if (!vaultId || !pin) return res.status(400).json({ message: 'Vault ID and PIN are required.' })
    const vault = await prisma.clientVault.findUnique({ where: { id: vaultId } })
    if (!vault || !vault.pinHash || !(await bcrypt.compare(pin, vault.pinHash))) {
      return res.status(401).json({ message: 'Invalid vault credentials.' })
    }
    return res.json({ token: jwt.sign({ vaultId: vault.id }, JWT_SECRET, { expiresIn: '7d' }) })
  }
  if (!email || !accessCode) return res.status(400).json({ message: 'Email and access code are required.' })
  const normalizedEmail = String(email).trim().toLowerCase()
  const normalizedAccessCode = String(accessCode || '').trim()
  const documents = await prisma.clientVault.findMany({
    where: { clientEmail: normalizedEmail, ...(normalizedAccessCode ? { accessCode: normalizedAccessCode } : {}) },
    orderBy: { createdAt: 'desc' },
  })
  if (!documents.length) return res.status(401).json({ message: 'Invalid email or access code.' })
  const token = jwt.sign({ vaultId: documents[0].id, clientEmail: documents[0].clientEmail, accessCode: normalizedAccessCode || null }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, vaultId: documents[0].id })
})

// Protected: get vault media
router.get('/:id', async (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.vaultId !== req.params.id && !payload.clientEmail) return res.status(403).json({ error: 'Forbidden' })
    if (payload.clientEmail) {
      const documents = await prisma.clientVault.findMany({
        where: { clientEmail: payload.clientEmail, ...(payload.accessCode ? { accessCode: payload.accessCode } : {}) },
        orderBy: { createdAt: 'desc' },
      })
      return res.json({ documents })
    }
    const media = await prisma.media.findMany({ where: { vaultId: req.params.id } })
    return res.json({ media })
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

module.exports = router
