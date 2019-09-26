require('dotenv').config()
const { NODE_ENV, STRIPE_PRIVATE_LIVE, STRIPE_PRIVATE_TEST } = process.env
const express = require('express')
const uuid = require('uuid/v4')
const router = express.Router()
const stripe = require('stripe')(
  NODE_ENV != 'development' ? STRIPE_PRIVATE_LIVE : STRIPE_PRIVATE_TEST
)

// GET /api/pay
router.post('/pay', async (req, res) => {
  let customer = null
  if (!req.body.token || !req.body.token.id) {
    return res.json({
      ok: false,
      msg: 'Token not received',
    })
  }

  if (!req.body.product) {
    return res.json({
      ok: false,
      msg: 'Product data not received',
    })
  }

  try {
    customer = await stripe.customers.create({
      email: req.body.token.email,
      source: req.body.token.id,
    })
  } catch (e) {
    console.error(e)
    return res.json({
      ok: false,
      msg: 'Error creating the customer'
    })
  }

  try {
    const result = await stripe.charges.create({
      amount: String(req.body.product.price).includes('.') ? req.body.product.price * 100 : req.body.product.price,
      currency: 'EUR',
      description: req.body.product.description,
      customer: customer.id,
      receipt_email: req.body.token.email, // Set the email to automatically send the invoice
    }, {
      idempotency_key: uuid(),
    })

    return res.json({
      ok: true,
      msg: 'Payment processed successfully',
      status: result.status,
      id: result.id,
    })
  } catch (e) {
    console.error(e)
    return res.json({
      ok: false,
      msg: 'There was an error processing your payment',
    })
  }
})

module.exports = router
