import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, counter_data, referral_id } = await req.json()

  const VALID_ACTIONS = ['accept', 'decline', 'counter_offer']
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (action === 'accept') {
    const { data: order } = await supabase
      .from('orders')
      .select('agreed_price, total_amount')
      .eq('id', id)
      .single()

    const useMilestone = (order?.agreed_price || order?.total_amount || 0) >= 500000

    await supabase
      .from('orders')
      .update({ status: 'PAYMENT_PENDING', payment_type: useMilestone ? 'milestone' : 'full' })
      .eq('id', id)
  } else if (action === 'decline') {
    await supabase.from('orders').update({ status: 'DECLINED' }).eq('id', id)

    if (referral_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('client_id')
        .eq('id', id)
        .single()

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.client_id,
          type: 'decline_referral',
          title: 'Kreator merekomendasikan kreator lain',
          body: `Lihat profil kreator yang direkomendasikan: ${referral_id}`,
        })
      }
    }
  } else if (action === 'counter_offer') {
    await supabase.from('orders').update({ status: 'COUNTER_OFFER' }).eq('id', id)
    await supabase.from('counter_offers').insert({
      order_id: id,
      ...counter_data,
    })
  }

  return NextResponse.json({ ok: true })
}
