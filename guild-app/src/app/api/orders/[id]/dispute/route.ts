import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason } = await req.json()

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const { error: orderError } = await supabase.from('orders').update({ status: 'DISPUTE' }).eq('id', id)
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const { error: disputeError } = await supabase.from('disputes').insert({
    order_id: id,
    filed_by: user.id,
    reason,
    status: 'open',
  })

  if (disputeError) {
    await supabase.from('orders').update({ status: 'IN_PROGRESS' }).eq('id', id)
    return NextResponse.json({ error: disputeError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
