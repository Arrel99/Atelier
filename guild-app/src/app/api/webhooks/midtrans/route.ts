import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const hash = crypto
    .createHash('sha512')
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest('hex')

  if (hash !== body.signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  if (body.transaction_status === 'settlement' || body.transaction_status === 'capture') {
    const { data: payment } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        midtrans_transaction_id: body.transaction_id,
      })
      .eq('midtrans_order_id', body.order_id)
      .select()
      .single()

    if (payment) {
      await supabase.from('orders').update({ status: 'IN_PROGRESS' }).eq('id', payment.order_id)

      const { data: order } = await supabase
        .from('orders')
        .select('creator_id')
        .eq('id', payment.order_id)
        .single()

      if (order) {
        const { data: cp } = await supabase
          .from('creator_profiles')
          .select('user_id')
          .eq('id', order.creator_id)
          .single()

        if (cp) {
          await supabase.from('notifications').insert({
            user_id: cp.user_id,
            order_id: payment.order_id,
            type: 'payment_received',
            title: 'Pembayaran Diterima!',
            body: 'Klien sudah membayar. Kamu bisa mulai mengerjakan proyek.',
          })
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
