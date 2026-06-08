import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfile from '@/components/PublicProfile'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('display_name', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: slots } = await supabase
    .from('slots')
    .select('*')
    .eq('creator_id', profile.id)
    .eq('is_available', true)
    .order('created_at', { ascending: true })

  const { data: activeOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('creator_id', profile.id)
    .in('status', ['PENDING_APPROVAL', 'IN_PROGRESS', 'FINAL_REVIEW'])

  const usedSlots = activeOrders?.length ?? 0
  const remainingSlots = profile.max_slots - usedSlots

  return (
    <PublicProfile
      profile={profile}
      slots={slots ?? []}
      remainingSlots={remainingSlots}
    />
  )
}
