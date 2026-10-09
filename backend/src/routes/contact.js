const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { createSubmissionEmails } = require('../config/submissionMailer')
const prisma = new PrismaClient()

router.post('/', async (req, res) => {
  const {
    name,
    email,
    user_email: userEmail,
    customer_email: customerEmail,
    projectType,
    requestType,
    date,
    message,
    service,
    equipment,
    contactInfo,
  } = req.body || {}
  const recipientEmail = email || userEmail || customerEmail
  const type = requestType || 'Inquiry'

  if (!name || !recipientEmail || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' })
  }

  try {
    const lead = await prisma.contactMessage.create({
      data: {
        name,
        email: recipientEmail,
        requestType: type,
        projectType: projectType || null,
        date: date ? new Date(date) : null,
        service: service || projectType || null,
        equipment: equipment || null,
        contactInfo: contactInfo || null,
        message,
      },
    })

    await Promise.all(createSubmissionEmails({
      name,
      userEmail: recipientEmail,
      requestType: type,
      date,
      service: service || projectType,
      equipment,
      contactInfo,
      message,
    }))

    return res.status(201).json({ ok: true, message: `${type} submitted successfully.`, lead })
  } catch (error) {
    console.error('Contact email error:', error)
    return res.status(500).json({
      message: 'Unable to send message right now. Please email hello@shadowleo.studio directly.',
    })
  }
})

module.exports = router
