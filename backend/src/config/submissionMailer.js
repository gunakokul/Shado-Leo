const transporter = require('./mailer')

const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER
const adminEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER

function createSubmissionEmails({
  name,
  userEmail,
  requestType,
  date,
  service,
  equipment,
  contactInfo,
  message,
}) {
  const details = [
    `Date: ${date || 'Not specified'}`,
    `Service/Equipment: ${service || equipment || 'Not specified'}`,
    `Contact Info: ${contactInfo || `${name} (${userEmail})`}`,
    message ? `Additional details: ${message}` : null,
  ].filter(Boolean).join('\n')

  return [
    transporter.sendMail({
      from,
      to: adminEmail,
      replyTo: userEmail,
      subject: `New ${requestType.toLowerCase()} from ${name}`,
      text: `Name: ${name}\nEmail: ${userEmail}\nRequest Type: ${requestType}\n${details}`,
    }),
    transporter.sendMail({
      from,
      to: userEmail,
      subject: `We received your ${requestType.toLowerCase()} request`,
      text: `Hi ${name},\n\nThank you for reaching out to Shadow Leo. We have received your ${requestType.toLowerCase()} request.\n\n${details}\n\nOur studio team will review your request and contact you shortly.\n\nWarmly,\nShadow Leo Studio`,
    }),
  ]
}

module.exports = { createSubmissionEmails }