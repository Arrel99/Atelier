import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order_id, payment_type } = await req.json()

  const { data: order } = await supabase
    .from('orders')
    .select('*, creator_profiles!inner(display_name, user_id), users!client_id(full_name)')
    .eq('id', order_id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const amount = payment_type === 'downpayment'
    ? Math.ceil((order.agreed_price || order.total_amount) * 0.5)
    : (order.agreed_price || order.total_amount)

  const midtransOrderId = `ORDER-${order_id.substring(0, 8)}-${Date.now()}`

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const midtransRes = await fetch('https://api.sandbox.midtrans.com/v1/payment-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64'),
    },
    body: JSON.stringify({
      transaction_details: { order_id: midtransOrderId, gross_amount: amount },
      customer_details: { first_name: order.users?.full_name || 'Customer' },
      item_details: [{
        id: order_id,
        price: amount,
        quantity: 1,
        name: `Jasa ${order.creator_profiles?.display_name} - ${payment_type}`,
      }],
    }),
  })

  const { payment_url } = await midtransRes.json()

  await supabase.from('payments').insert({
    order_id,
    type: payment_type === 'downpayment' ? 'downpayment' : 'settlement',
    amount,
    status: 'pending',
    midtrans_order_id: midtransOrderId,
  })

  return NextResponse.json({ payment_url })
}
