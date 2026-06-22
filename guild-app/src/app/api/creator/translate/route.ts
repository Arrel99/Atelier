import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEEPL_API = 'https://api-free.deepl.com/v2/translate'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, target_lang = 'JA', source_lang } = await req.json()
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'DeepL not configured' }, { status: 500 })

  const params = new URLSearchParams({ text, target_lang })
  if (source_lang) params.set('source_lang', source_lang)

  const res = await fetch(DEEPL_API, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 502 })
  }

  const json = await res.json()
  const translated = json.translations?.[0]?.text ?? ''

  await supabase.from('translations').insert({
    source_text: text,
    translated_text: translated,
    source_lang: source_lang?.toLowerCase() ?? 'auto',
    target_lang: target_lang.toLowerCase(),
    context: 'creator_form',
  })

  return NextResponse.json({ translated_text: translated })
}
