import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()

  if (typeof action !== 'string' || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (action === 'accept') {
    await supabase.from('orders').update({ status: 'PAYMENT_PENDING' }).eq('id', id)
    await supabase.from('counter_offers').update({ status: 'accepted' }).eq('order_id', id)
  } else {
    await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', id)
    await supabase.from('counter_offers').update({ status: 'rejected' }).eq('order_id', id)
  }

  return NextResponse.json({ ok: true })
}
