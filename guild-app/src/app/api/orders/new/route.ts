import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slot_config_id, category, answers, completeness_score, project_title, description } = await req.json()

  const { data: slot } = await supabase
    .from('slots')
    .select('creator_id, price')
    .eq('id', slot_config_id)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      creator_id: slot.creator_id,
      client_id: user.id,
      slot_id: slot_config_id,
      slot_config_id,
      status: 'BRIEF_PENDING',
      total_amount: slot.price,
      down_payment: Math.round(slot.price * 0.5),
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 })

  const { error: briefError } = await supabase.from('briefs').insert({
    order_id: order.id,
    project_title: project_title || 'Pesanan Baru',
    description: description || '',
    category,
    completeness_score,
    fields: answers,
    answers,
  })

  if (briefError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: briefError.message }, { status: 400 })
  }

  return NextResponse.json({ order_id: order.id })
}
