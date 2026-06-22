import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { winner, mediator_notes } = await req.json()

  if (!winner || !['client', 'creator'].includes(winner)) {
    return NextResponse.json({ error: 'Winner must be client or creator' }, { status: 400 })
  }

  const { error: disputeError } = await supabase
    .from('disputes')
    .update({
      status: `resolved_${winner}`,
      mediator_notes,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (disputeError) return NextResponse.json({ error: disputeError.message }, { status: 500 })

  const { data: dispute } = await supabase
    .from('disputes')
    .select('order_id')
    .eq('id', id)
    .single()

  if (dispute) {
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: winner === 'creator' ? 'COMPLETED' : 'CANCELLED' })
      .eq('id', dispute.order_id)

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
