import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { watermarkImage, watermarkVideo, isVideo } from '@/lib/watermark'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const order_id = formData.get('order_id') as string
  const type = formData.get('type') as string

  if (!file || !order_id) {
    return NextResponse.json({ error: 'File and order_id required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const watermarked = isVideo(file.type)
    ? await watermarkVideo(buffer)
    : await watermarkImage(buffer)

  const ext = file.name.split('.').pop() || 'bin'
  const fileName = `${order_id}/${type}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('deliverables')
    .upload(fileName, watermarked, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('deliverables')
    .getPublicUrl(fileName)

  await supabase.from('deliverables').insert({
    order_id,
    type: type || 'draft',
    file_url: publicUrl,
    watermarked_url: publicUrl,
    original_url: publicUrl,
    is_final: type === 'final',
    is_watermarked: true,
  })

  if (type === 'final') {
    await supabase.from('orders').update({
      status: 'FINAL_REVIEW',
      auto_release_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', order_id)
  }

  return NextResponse.json({ ok: true, url: publicUrl })
}
