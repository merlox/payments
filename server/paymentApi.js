require('dotenv').config()
const { NODE_ENV, STRIPE_PRIVATE_LIVE, STRIPE_PRIVATE_TEST } = process.env
const express = require('express')
const uuid = require('uuid/v4')
const router = express.Router()
const stripe = require('stripe')(
  NODE_ENV != 'development' ? STRIPE_PRIVATE_LIVE : STRIPE_PRIVATE_TEST
)

// GET /api/pay/<amount>
router.get('/pay/:amount', async (req, res) => {
  const result = await stripe.charges.create({
    amount: req.params.amount,
    currency: 'eur',
    description: `Purchasing the full stack web development course for ${req.params.amount}`,
    // receipt_email: '', Set the email to automatically send the invoice
  })
  console.log('Hi', result)
})

module.exports = router
