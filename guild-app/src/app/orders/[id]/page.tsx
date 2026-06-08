import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import OrderTracker from '@/components/OrderTracker'

export default async function OrderTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, briefs(*), creator_profiles!inner(*), deliverables(*)')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const isClient = order.client_id === user.id
  const isCreator = order.creator_profiles?.user_id === user.id

  if (!isClient && !isCreator) {
    redirect('/dashboard')
  }

  const { data: history } = await supabase
    .from('order_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  return (
    <OrderTracker
      order={order}
      history={history ?? []}
      isClient={isClient}
      isCreator={isCreator}
    />
  )
}
