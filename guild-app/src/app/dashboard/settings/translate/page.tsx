'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputSx: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.85rem',
  border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
  fontSize: '0.85rem', color: 'hsl(197 20% 12%)',
  background: '#fff', outline: 'none', fontFamily: 'var(--font-body)',
  transition: 'border-color 0.12s',
}

const LANGUAGES = [
  { code: 'JA', label: 'Bahasa Jepang' },
  { code: 'EN', label: 'Bahasa Inggris' },
  { code: 'KO', label: 'Bahasa Korea' },
  { code: 'ZH', label: 'Bahasa Mandarin' },
  { code: 'FR', label: 'Bahasa Prancis' },
  { code: 'DE', label: 'Bahasa Jerman' },
  { code: 'ES', label: 'Bahasa Spanyol' },
  { code: 'AR', label: 'Bahasa Arab' },
]

export default function TranslateSettingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [sourceText, setSourceText] = useState('')
  const [targetLang, setTargetLang] = useState('JA')
  const [translated, setTranslated] = useState('')
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  type SourceItem = { id: string; label: string; preview: string; type: 'form' | 'service' | 'policy' }
  const [forms, setForms] = useState<SourceItem[]>([])
  const [services, setServices] = useState<SourceItem[]>([])
  const [policies, setPolicies] = useState<SourceItem[]>([])
  const [activeTab, setActiveTab] = useState<'form' | 'service' | 'policy'>('form')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [formsRes, servicesRes, policiesRes] = await Promise.all([
        fetch('/api/creator/forms'),
        fetch('/api/creator/services'),
        fetch('/api/creator/policies'),
      ])

      if (formsRes.ok) {
        const data = await formsRes.json()
        setForms(data.map((f: any) => ({ id: f.id, label: f.title, preview: f.title, type: 'form' as const })))
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setServices(data.map((s: any) => ({ id: s.id, label: s.name, preview: `${s.name} — ${s.description ?? ''}`, type: 'service' as const })))
      }
      if (policiesRes.ok) {
        const data = await policiesRes.json()
        setPolicies(data.map((p: any) => ({ id: p.id, label: p.title, preview: `${p.title}: ${p.content ?? ''}`, type: 'policy' as const })))
      }
    }
    init()
  }, [supabase])

  async function handleTranslate() {
    if (!sourceText.trim()) return
    setTranslating(true); setError(''); setTranslated('')
    const res = await fetch('/api/creator/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText, target_lang: targetLang }),
    })
    setTranslating(false)
    if (!res.ok) { const j = await res.json(); setError(j.error || 'Gagal menerjemahkan'); return }
    const { translated_text } = await res.json()
    setTranslated(translated_text)
  }

  async function copyResult() {
    if (translated) {
      await navigator.clipboard.writeText(translated)
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', marginBottom: '0.5rem' }}>
        Penerjemah
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'hsl(197 20% 55%)', marginBottom: '1.2rem' }}>
        Terjemahkan teks formulir, layanan, atau kebijakan ke bahasa asing (DeepL).
      </p>

      {/* Translate form */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Terjemahkan</p>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)' }}>{error}</div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(197 20% 45%)', display: 'block', marginBottom: '0.3rem' }}>
              Bahasa Target
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button key={l.code} type="button" onClick={() => setTargetLang(l.code)} style={{
                  padding: '0.4rem 0.9rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500,
                  border: `1.5px solid ${targetLang === l.code ? '#87CEEB' : 'hsl(197 30% 88%)'}`,
                  background: targetLang === l.code ? 'hsl(197 72% 93%)' : '#fff',
                  color: targetLang === l.code ? 'hsl(197 45% 38%)' : 'hsl(197 20% 50%)',
                  cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'var(--font-body)',
                }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(197 20% 45%)', display: 'block', marginBottom: '0.3rem' }}>
              Teks Asli (Bahasa Indonesia)
            </label>
            <textarea value={sourceText} onChange={e => setSourceText(e.target.value)} rows={4}
              placeholder="Tulis teks yang ingin diterjemahkan…" style={inputSx}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>

          <button onClick={handleTranslate} disabled={translating || !sourceText.trim()} style={{
            padding: '0.65rem 1.5rem', alignSelf: 'flex-start',
            background: translating ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
            color: '#fff', border: 'none', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500,
            cursor: translating || !sourceText.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}>
            {translating ? 'Menerjemahkan…' : 'Terjemahkan'}
          </button>

          {translated && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(197 20% 45%)' }}>
                  Hasil Terjemahan
                </label>
                <button onClick={copyResult} style={{
                  background: 'none', border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
                  padding: '0.25rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer',
                  color: 'hsl(197 45% 38%)', fontFamily: 'var(--font-body)',
                }}>
                  Salin
                </button>
              </div>
              <div style={{
                padding: '0.85rem', border: '1px solid hsl(152 40% 82%)', borderRadius: 8,
                background: 'hsl(152 40% 96%)', fontSize: '0.85rem', color: 'hsl(152 55% 25%)',
                lineHeight: 1.5,
              }}>
                {translated}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sumber konten */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Sumber Konten</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          {(['form', 'service', 'policy'] as const).map(tab => {
            const count = tab === 'form' ? forms.length : tab === 'service' ? services.length : policies.length
            const label = tab === 'form' ? 'Formulir' : tab === 'service' ? 'Layanan' : 'Kebijakan'
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.78rem', fontWeight: 500,
                border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#87CEEB' : 'transparent'}`,
                background: activeTab === tab ? 'hsl(197 72% 96%)' : '#fff',
                color: activeTab === tab ? 'hsl(197 45% 38%)' : 'hsl(197 20% 55%)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {label} ({count})
              </button>
            )
          })}
        </div>

        {/* List */}
        {(() => {
          const items = activeTab === 'form' ? forms : activeTab === 'service' ? services : policies
          if (items.length === 0) {
            const noun = activeTab === 'form' ? 'formulir' : activeTab === 'service' ? 'layanan' : 'kebijakan'
            return (
              <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>
                Belum ada {noun}. Buat {noun} di halaman terkait terlebih dahulu.
              </p>
            )
          }
          return (
            <div>
              {items.map((h, i) => (
                <div key={h.id} style={{
                  padding: '0.7rem 1.25rem', borderTop: i > 0 ? '1px solid hsl(197 30% 93%)' : undefined,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'hsl(197 20% 25%)' }}>{h.label}</span>
                  <button onClick={() => setSourceText(h.preview)} style={{
                    background: 'none', border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
                    padding: '0.25rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer',
                    color: 'hsl(197 45% 38%)', fontFamily: 'var(--font-body)',
                  }}>
                    Gunakan
                  </button>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
