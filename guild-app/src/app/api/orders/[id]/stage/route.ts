import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stage_index } = await req.json()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('tracker_stages, current_stage_index, creator_id')
    .eq('id', id)
    .single()

  if (fetchError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('id', order.creator_id)
    .eq('user_id', user.id)
    .single()

  if (!cp) return NextResponse.json({ error: 'Only creator can advance stage' }, { status: 403 })

  const maxIndex = (order.tracker_stages?.length || 4) - 1
  if (stage_index > maxIndex || stage_index < order.current_stage_index) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  await supabase.from('orders').update({ current_stage_index: stage_index }).eq('id', id)

  return NextResponse.json({ ok: true })
}
