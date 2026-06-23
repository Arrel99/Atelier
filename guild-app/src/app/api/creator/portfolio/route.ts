import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = await createClient()

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's creator profile
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden: Profile not found' }, { status: 403 })
  }

  // Fetch all portfolios for this creator using service role client to bypass broken RLS
  const serviceClient = createServiceClient()
  const { data: portfolios, error } = await serviceClient
    .from('creator_portfolios')
    .select('*')
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(portfolios ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's creator profile
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden: Profile not found' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const title = formData.get('title')
    const description = formData.get('description')
    const project_url = formData.get('project_url')
    const status = formData.get('status') || 'published'

    if (!(file instanceof File) || typeof title !== 'string') {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'bin'
    const fileName = `${profile.id}/${Date.now()}.${ext}`

    // Upload to 'portfolios' bucket
    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolios')
      .getPublicUrl(fileName)

    // Insert portfolio record using service client to bypass RLS
    const serviceClient = createServiceClient()
    const { data: portfolioItem, error: insertError } = await serviceClient
      .from('creator_portfolios')
      .insert({
        creator_id: profile.id,
        title,
        description: description || null,
        image_url: publicUrl,
        project_url: project_url || null,
        status: status === 'draft' ? 'draft' : 'published',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: portfolioItem })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
