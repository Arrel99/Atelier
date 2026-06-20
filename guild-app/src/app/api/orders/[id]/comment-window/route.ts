import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duration_hours } = await req.json()

  const now = new Date()
  const closes_at = new Date(now.getTime() + (duration_hours || 48) * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('comment_windows')
    .insert({
      order_id: id,
      opens_at: now.toISOString(),
      closes_at: closes_at.toISOString(),
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
