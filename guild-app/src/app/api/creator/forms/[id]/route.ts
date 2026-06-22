import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getCreatorId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('creator_profiles').select('id').eq('user_id', user.id).single()
  return data?.id ?? null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const creatorId = await getCreatorId(supabase)
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('custom_forms')
    .select('*, fields:form_fields(*)')
    .eq('id', id)
    .eq('creator_id', creatorId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const creatorId = await getCreatorId(supabase)
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fields, ...form } = await req.json()

  const { data, error } = await supabase
    .from('custom_forms')
    .update(form)
    .eq('id', id)
    .eq('creator_id', creatorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (fields) {
    await supabase.from('form_fields').delete().eq('form_id', id)
    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(fields.map((f: any) => ({ ...f, form_id: id })))

    if (fieldsError) return NextResponse.json({ error: fieldsError.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const creatorId = await getCreatorId(supabase)
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('custom_forms')
    .delete()
    .eq('id', id)
    .eq('creator_id', creatorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
