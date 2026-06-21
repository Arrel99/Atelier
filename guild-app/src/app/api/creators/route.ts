import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: creators } = await supabase
    .from('creator_profiles')
    .select(`*, users!inner(full_name, avatar_url), reputation_badges(badge_type), slot_boosts(is_active, expires_at)`)
    .eq('is_verified', true)
    .order('created_at', { ascending: false })

  type SlotBoost = { is_active: boolean; expires_at: string }

  const sorted = creators?.sort((a, b) => {
    const aBoost = a.slot_boosts as unknown as SlotBoost[] | undefined
    const bBoost = b.slot_boosts as unknown as SlotBoost[] | undefined
    const aHasBoost = aBoost?.some((b) => b.is_active && b.expires_at > now)
    const bHasBoost = bBoost?.some((b) => b.is_active && b.expires_at > now)
    if (aHasBoost && !bHasBoost) return -1
    if (!aHasBoost && bHasBoost) return 1
    return (b.on_time_rate || 0) - (a.on_time_rate || 0)
  })

  return NextResponse.json(sorted ?? [])
}
