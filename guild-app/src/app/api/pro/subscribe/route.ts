import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cp) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

  const midtransOrderId = `PRO-${cp.id.substring(0, 8)}-${Date.now()}`
  const amount = 99000

  const res = await fetch('https://api.sandbox.midtrans.com/v1/payment-links', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64'),
    },
    body: JSON.stringify({
      transaction_details: { order_id: midtransOrderId, gross_amount: amount },
      item_details: [{ id: 'pro_plan', price: amount, quantity: 1, name: 'Creator Pro Plan - 1 Bulan' }],
    }),
  })

  const { payment_url } = await res.json()

  await supabase.from('pro_subscriptions').insert({
    creator_id: cp.id,
    status: 'pending',
    midtrans_order_id: midtransOrderId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return NextResponse.json({ payment_url })
}
