const express = require('express')
const router = express.Router()
const Stripe = require('stripe')

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

router.post('/checkout', async (req, res) => {
  const { items = [], customerEmail, packageName, amount } = req.body || {}

  if (!stripe) {
    return res.status(503).json({
      message: 'Payment gateway is not configured yet. Add your Stripe secret key to enable secure checkout.',
    })
  }

  if (!items.length && !packageName) {
    return res.status(400).json({ message: 'No items or package selected for checkout.' })
  }

  const lineItems = (items.length ? items : [{ name: packageName || 'Shadow Leo package', amount: Number(amount || 0) * 100, quantity: 1 }]).map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name || 'Shadow Leo purchase',
      },
      unit_amount: Math.max(0, Number(item.amount || item.price || 0) * 100),
    },
    quantity: item.quantity || 1,
  }))

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?checkout=cancelled`,
      customer_email: customerEmail || undefined,
      metadata: {
        source: 'shadow-leo',
        packageName: packageName || 'custom-order',
      },
    })

    return res.json({ ok: true, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ message: 'Unable to create a secure payment session.' })
  }
})

module.exports = router
