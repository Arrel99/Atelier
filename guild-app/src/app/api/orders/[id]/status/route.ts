import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Finite State Machine valid transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  BRIEF_PENDING: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['IN_PROGRESS', 'DECLINED', 'COUNTER_OFFER', 'CANCELLED'],
  COUNTER_OFFER: ['PENDING_APPROVAL', 'CANCELLED'],
  IN_PROGRESS: ['FINAL_REVIEW', 'DISPUTED'],
  FINAL_REVIEW: ['APPROVED', 'DISPUTED', 'IN_PROGRESS'],
  APPROVED: [],
  DECLINED: [],
  DISPUTED: ['APPROVED', 'CANCELLED'],
  CANCELLED: [],
}

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
  const { newStatus } = body as { newStatus: string }

  if (!newStatus) {
    return NextResponse.json({ error: 'newStatus required' }, { status: 400 })
  }

  // Get current order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, creator_profiles!inner(user_id)')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Check if user is authorized (client or creator)
  const isClient = order.client_id === user.id
  const isCreator = order.creator_profiles?.user_id === user.id

  if (!isClient && !isCreator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Validate transition
  const allowedTransitions = VALID_TRANSITIONS[order.status]
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return NextResponse.json({
      error: `Invalid transition from ${order.status} to ${newStatus}`,
    }, { status: 400 })
  }

  // Role-based transition restrictions
  const CREATOR_ONLY = ['IN_PROGRESS', 'FINAL_REVIEW', 'DECLINED', 'COUNTER_OFFER']
  const CLIENT_ONLY = ['APPROVED', 'CANCELLED', 'DISPUTED']

  if (CREATOR_ONLY.includes(newStatus) && !isCreator) {
    return NextResponse.json({ error: 'Only creator can perform this action' }, { status: 403 })
  }

  if (CLIENT_ONLY.includes(newStatus) && !isClient) {
    return NextResponse.json({ error: 'Only client can perform this action' }, { status: 403 })
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
