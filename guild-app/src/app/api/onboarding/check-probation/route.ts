import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { creator_id } = await req.json()

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', creator_id)
    .eq('status', 'COMPLETED')

  const probationCompleted = (count || 0) >= 3

  if (probationCompleted) {
    await supabase
      .from('creator_profiles')
      .update({ probation_completed: true, is_verified: true })
      .eq('id', creator_id)
  }

  return NextResponse.json({ probation_completed: probationCompleted })
}
