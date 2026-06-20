import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { order_id, creator_id } = await req.json()

  const { data: membership } = await supabase
    .from('studio_members')
    .select('id')
    .eq('studio_id', id)
    .eq('creator_id', creator_id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Kreator bukan anggota studio' }, { status: 400 })
  }

  await supabase.from('orders').update({ creator_id }).eq('id', order_id)

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('user_id')
    .eq('id', creator_id)
    .single()

  if (cp) {
    await supabase.from('notifications').insert({
      user_id: cp.user_id,
      order_id,
      type: 'order_assigned',
      title: 'Order Baru Ditugaskan',
      body: 'Manager studio menugaskan order baru kepadamu.',
    })
  }

  return NextResponse.json({ ok: true })
}
