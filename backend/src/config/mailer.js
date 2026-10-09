const nodemailer = require('nodemailer')

const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER

const emailPass = (
  process.env.EMAIL_PASS ||
  process.env.SMTP_PASS ||
  ''
).replace(/\s+/g, '')

console.log('SMTP USER:', emailUser)
console.log('SMTP PASSWORD EXISTS:', Boolean(emailPass))
console.log('SMTP PASSWORD LENGTH:', emailPass.length)

if (!emailUser || !emailPass) {
  throw new Error('SMTP username/password missing')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP VERIFY ERROR:', error)
  } else {
    console.log('SMTP READY:', success)
  }
})

module.exports = transporter