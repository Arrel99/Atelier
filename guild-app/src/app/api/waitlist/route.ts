import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slot_config_id } = await req.json()

  const { data: last } = await supabase
    .from('waitlist')
    .select('position')
    .eq('slot_config_id', slot_config_id)
    .eq('status', 'waiting')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (last?.position || 0) + 1

  const { error } = await supabase.from('waitlist').insert({
    slot_config_id,
    client_id: user.id,
    position: nextPosition,
    status: 'waiting',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ position: nextPosition })
}
