import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { feedback, reference_urls } = await req.json()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('revision_count, max_revisions, client_id')
    .eq('id', id)
    .single()

  if (fetchError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (order.client_id !== user.id) return NextResponse.json({ error: 'Only client can request revision' }, { status: 403 })

  if (order.revision_count >= order.max_revisions) {
    return NextResponse.json({
      error: 'Batas revisi tercapai. Tambahan revisi dikenakan biaya.',
      exceeded: true,
    }, { status: 400 })
  }

  const newCount = order.revision_count + 1

  const { error: revisionError } = await supabase.from('revisions').insert({
    order_id: id,
    revision_number: newCount,
    feedback,
    reference_urls: reference_urls || [],
  })

  if (revisionError) return NextResponse.json({ error: revisionError.message }, { status: 500 })

  const { error: updateError } = await supabase.from('orders').update({
    status: 'REVISION_REQUESTED',
    revision_count: newCount,
  }).eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ revision_number: newCount })
}
