import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cp) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('slots')
    .insert({ ...body, creator_id: cp.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cp) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

  const { data } = await supabase
    .from('slots')
    .select('*')
    .eq('creator_id', cp.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
