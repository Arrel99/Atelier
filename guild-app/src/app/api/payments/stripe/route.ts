import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order_id, amount } = await req.json()
  if (!order_id || !amount) return NextResponse.json({ error: 'Missing order_id or amount' }, { status: 400 })

  const Stripe = require('stripe')
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency: 'jpy',
    metadata: { order_id, user_id: user.id },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
