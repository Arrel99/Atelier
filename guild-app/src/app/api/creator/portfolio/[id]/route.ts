import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const body = await request.json()
    const { title, description, project_url, status } = body

    const serviceClient = createServiceClient()

    // First verify that this portfolio item belongs to the authenticated creator
    const { data: existing, error: findError } = await serviceClient
      .from('creator_portfolios')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    if (existing.creator_id !== profile.id) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    // Perform update
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (project_url !== undefined) updateData.project_url = project_url
    if (status !== undefined) {
      updateData.status = status === 'draft' ? 'draft' : 'published'
    }

    const { data: updated, error: updateError } = await serviceClient
      .from('creator_portfolios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const serviceClient = createServiceClient()

    // Find existing to get the creator_id and image_url (to delete from storage)
    const { data: existing, error: findError } = await serviceClient
      .from('creator_portfolios')
      .select('creator_id, image_url')
      .eq('id', id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    if (existing.creator_id !== profile.id) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    // Delete database record
    const { error: deleteError } = await serviceClient
      .from('creator_portfolios')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Attempt to delete file from storage bucket if possible
    try {
      if (existing.image_url) {
        // extract filepath from public URL
        // e.g. /storage/v1/object/public/portfolios/profile-id/filename.ext
        const match = existing.image_url.match(/portfolios\/(.+)$/)
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1])
          await supabase.storage.from('portfolios').remove([filePath])
        }
      }
    } catch (storageErr) {
      console.error('Failed to delete storage file:', storageErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
