import React, { useState } from 'react'
import { render } from 'react-dom'
import { ToastContainer, toast } from 'react-toastify'
import StripeCheckout from 'react-stripe-checkout'
import 'react-toastify/dist/ReactToastify.min.css'

const publishableStripeKey = process.env.NODE_ENV == 'development' ? 'pk_test_FQldtDS3eGIjDpL0uF6kMaZd' : 'pk_live_VKurm5cjLRyskisXWIvxocDq'

function App (props) {
  const [product] = useState({
    price: 997.95,
    name: 'Web dev course',
    description: 'The fullstack web dev course',
    currency: 'EUR',
  })

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>Product: {product.name}</h2>
      <h2>Price: {product.price}</h2>

      <Checkout product={product} />
      <ToastContainer />
    </div>
  )
}

function Checkout (props) {
  const product = props.product

  const pay = async token => {
    try {
      let response = await fetch('/api/pay', {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token,
          product,
        })
      })

      response = await response.json()
      if (!response.ok) {
        toast('There was an error processing your payment', {type: 'error'})
      } else {
        toast(`Great! the payment has been made successfully`, {type: 'success'})
      }
    } catch (e) {
      console.log('Error', e)
      toast(`Error processing the payment ${e}`, {type: 'error'})
    }
  }

  return (
    <div>
      <StripeCheckout
        stripeKey={publishableStripeKey}
        token={pay}
        amount={product.price * 100}
        name={product.name}
        description={product.description}
        currency={product.currency}
      />
    </div>
  )
}

render(<App />, document.querySelector('#root'))
