import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { creator_username, role } = await req.json()

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('username', creator_username)
    .single()

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', userData.id)
    .single()

  if (!cp) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  const { error } = await supabase.from('studio_members').insert({
    studio_id: id,
    creator_id: cp.id,
    role: role || 'member',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('notifications').insert({
    user_id: userData.id,
    type: 'studio_invitation',
    title: 'Undangan Studio',
    body: 'Kamu diundang untuk bergabung ke sebuah studio.',
  })

  return NextResponse.json({ ok: true })
}
