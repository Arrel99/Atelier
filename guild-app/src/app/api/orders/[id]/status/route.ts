import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FSM } from '@/lib/constants'
import type { OrderStatus } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { newStatus } = body as { newStatus: OrderStatus }

  if (!newStatus) {
    return NextResponse.json({ error: 'newStatus required' }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, creator_profiles!inner(user_id)')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const isClient = order.client_id === user.id
  const isCreator = order.creator_profiles?.user_id === user.id

  if (!isClient && !isCreator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const orderStatus = order.status as OrderStatus
  const allowedTransitions = FSM[orderStatus]
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return NextResponse.json({
      error: `Invalid transition from ${order.status} to ${newStatus}`,
    }, { status: 400 })
  }

  const CREATOR_ONLY: OrderStatus[] = ['IN_PROGRESS', 'FINAL_REVIEW', 'DECLINED', 'COUNTER_OFFER']
  const CLIENT_ONLY: OrderStatus[] = ['APPROVED', 'CANCELLED', 'DISPUTE']

  if (CREATOR_ONLY.includes(newStatus) && !isCreator) {
    return NextResponse.json({ error: 'Only creator can perform this action' }, { status: 403 })
  }

  if (CLIENT_ONLY.includes(newStatus) && !isClient) {
    return NextResponse.json({ error: 'Only client can perform this action' }, { status: 403 })
  }

  const updates: Record<string, string | boolean | undefined> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (newStatus === 'FINAL_REVIEW') {
    updates.auto_release_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
