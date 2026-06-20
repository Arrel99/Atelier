import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, bio } = await req.json()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data: studio, error } = await supabase
    .from('studios')
    .insert({ owner_id: user.id, name, slug, bio })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (cp) {
    await supabase.from('studio_members').insert({
      studio_id: studio.id,
      creator_id: cp.id,
      role: 'owner',
    })
  }

  return NextResponse.json(studio)
}
