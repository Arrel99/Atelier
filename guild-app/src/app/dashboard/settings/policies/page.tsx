'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CustomPolicy {
  id: string
  creator_id: string
  title: string
  content: string
  category: string
  display_order: number
  is_active: boolean
  created_at: string
}

const inputSx: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.85rem',
  border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
  fontSize: '0.85rem', color: 'hsl(197 20% 12%)',
  background: '#fff', outline: 'none', fontFamily: 'var(--font-body)',
  transition: 'border-color 0.12s',
}

const labelSx: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 500, color: 'hsl(197 20% 45%)',
  display: 'block', marginBottom: '0.3rem',
}

const CATEGORIES = ['revision', 'copyright', 'payment', 'delivery', 'refund', 'other']

export default function PoliciesSettingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [policies, setPolicies] = useState<CustomPolicy[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('revision')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      loadPolicies()
    }
    init()
  }, [supabase])

  async function loadPolicies() {
    setLoading(true)
    const res = await fetch('/api/creator/policies')
    if (res.ok) setPolicies(await res.json())
    setLoading(false)
  }

  function resetForm() {
    setTitle(''); setContent(''); setCategory('revision'); setDisplayOrder('0')
    setEditingId(null); setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    const body = { title, content, category, display_order: parseInt(displayOrder, 10) }

    const url = editingId ? `/api/creator/policies/${editingId}` : '/api/creator/policies'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setError(j.error); return }
    resetForm()
    loadPolicies()
    router.refresh()
  }

  function startEdit(p: CustomPolicy) {
    setTitle(p.title); setContent(p.content); setCategory(p.category)
    setDisplayOrder(String(p.display_order)); setEditingId(p.id)
  }

  async function remove(p: CustomPolicy) {
    if (!confirm(`Hapus kebijakan "${p.title}"?`)) return
    await fetch(`/api/creator/policies/${p.id}`, { method: 'DELETE' })
    loadPolicies()
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', marginBottom: '1rem' }}>
        Kebijakan
      </h2>

      {/* Editor */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>
            {editingId ? 'Edit Kebijakan' : 'Tambah Kebijakan'}
          </p>
        </div>
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)' }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelSx}>Judul</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Kebijakan revisi" style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
            <div>
              <label style={labelSx}>Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputSx}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelSx}>Urutan Tampil</label>
            <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} min={0} style={{ ...inputSx, width: 100 }}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>
          <div>
            <label style={labelSx}>Konten</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={5} placeholder="Tulis kebijakan di sini…" style={inputSx}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={{
              padding: '0.65rem 1.5rem', background: saving ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
              color: '#fff', border: 'none', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {saving ? 'Menyimpan…' : editingId ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{
                padding: '0.65rem 1.5rem', background: '#fff', color: 'hsl(197 20% 50%)',
                border: '1px solid hsl(197 30% 88%)', borderRadius: 999, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Daftar Kebijakan</p>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 999, background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)' }}>{policies.length}</span>
        </div>
        {loading ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Memuat…</p>
        ) : policies.length === 0 ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Belum ada kebijakan.</p>
        ) : (
          policies.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid hsl(197 30% 93%)' : undefined,
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>{p.title}</p>
                <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.category} · urutan {p.display_order}
                  {p.is_active ? '' : ' · nonaktif'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => startEdit(p)} style={{ background: 'none', border: '1px solid hsl(197 30% 88%)', borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: 'hsl(197 45% 38%)' }}>Edit</button>
                <button onClick={() => remove(p)} style={{ background: 'none', border: 'none', color: 'hsl(0 65% 55%)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem' }}>Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
