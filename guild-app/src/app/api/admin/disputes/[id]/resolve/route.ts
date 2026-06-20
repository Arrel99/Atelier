import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { winner, mediator_notes } = await req.json()

  await supabase
    .from('disputes')
    .update({
      status: `resolved_${winner}`,
      mediator_notes,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)

  const { data: dispute } = await supabase
    .from('disputes')
    .select('order_id')
    .eq('id', id)
    .single()

  if (dispute) {
    await supabase
      .from('orders')
      .update({ status: winner === 'creator' ? 'COMPLETED' : 'CANCELLED' })
      .eq('id', dispute.order_id)
  }

  return NextResponse.json({ ok: true })
}
