import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfile from '@/components/PublicProfile'
import type { CreatorProfile } from '@/types'

interface ProfileWithBadges extends CreatorProfile {
  reputation_badges?: Array<{ badge_type: string; id: string }>
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const profileResult = await supabase
    .from('creator_profiles')
    .select('*, reputation_badges(badge_type, id)')
    .eq('display_name', username)
    .single()

  const profile = profileResult.data as ProfileWithBadges | null

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
