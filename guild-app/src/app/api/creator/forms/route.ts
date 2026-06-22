import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getCreatorId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('creator_profiles').select('id').eq('user_id', user.id).single()
  return data?.id ?? null
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const creatorId = await getCreatorId(supabase)
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('custom_forms')
    .select('*, fields:form_fields(*)')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const creatorId = await getCreatorId(supabase)
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fields, ...form } = await req.json()

  const { data, error } = await supabase
    .from('custom_forms')
    .insert({ ...form, creator_id: creatorId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (fields?.length) {
    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(fields.map((f: any) => ({ ...f, form_id: data.id })))

    if (fieldsError) return NextResponse.json({ error: fieldsError.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
