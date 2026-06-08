import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SlotManager from '@/components/SlotManager'

export default async function SlotsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  const { data: slots } = await supabase
    .from('slots')
    .select('*')
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Kelola Slot</h1>
      <SlotManager profile={profile} slots={slots ?? []} />
    </div>
  )
}
