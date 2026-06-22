'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CustomService {
  id: string
  creator_id: string
  name: string
  description: string | null
  category: string
  price: number | null
  duration: string | null
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

const CATEGORIES = ['illustration', 'design', 'animation', 'photography', 'consultation', 'other']

export default function ServicesSettingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [services, setServices] = useState<CustomService[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('illustration')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      loadServices()
    }
    init()
  }, [supabase])

  async function loadServices() {
    setLoading(true)
    const res = await fetch('/api/creator/services')
    if (res.ok) setServices(await res.json())
    setLoading(false)
  }

  function resetForm() {
    setName(''); setCategory('illustration'); setDescription(''); setPrice(''); setDuration('')
    setEditingId(null); setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    const body: Record<string, any> = { name, category, description: description || null, duration: duration || null }
    if (price) body.price = parseFloat(price)

    const url = editingId ? `/api/creator/services/${editingId}` : '/api/creator/services'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setError(j.error); return }
    resetForm()
    loadServices()
    router.refresh()
  }

  function startEdit(s: CustomService) {
    setName(s.name); setCategory(s.category); setDescription(s.description ?? '')
    setPrice(s.price != null ? String(s.price) : ''); setDuration(s.duration ?? '')
    setEditingId(s.id)
  }

  async function toggleActive(s: CustomService) {
    await fetch(`/api/creator/services/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !s.is_active }),
    })
    loadServices()
    router.refresh()
  }

  async function remove(s: CustomService) {
    if (!confirm(`Hapus "${s.name}"?`)) return
    await fetch(`/api/creator/services/${s.id}`, { method: 'DELETE' })
    loadServices()
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', marginBottom: '1rem' }}>
        Layanan
      </h2>

      {/* Editor */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>
            {editingId ? 'Edit Layanan' : 'Tambah Layanan'}
          </p>
        </div>
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)' }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelSx}>Nama</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Nama layanan" style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
            <div>
              <label style={labelSx}>Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputSx}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSx}>Harga (Rp, opsional)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} placeholder="500000" style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
            <div>
              <label style={labelSx}>Durasi (opsional)</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="1-2 minggu" style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
          </div>

          <div>
            <label style={labelSx}>Deskripsi (opsional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Detail layanan" style={inputSx}
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
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Daftar Layanan</p>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 999, background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)' }}>{services.length}</span>
        </div>
        {loading ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Memuat…</p>
        ) : services.length === 0 ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Belum ada layanan.</p>
        ) : (
          services.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid hsl(197 30% 93%)' : undefined,
            }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>{s.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
                  {s.category}{s.price ? ` · Rp${s.price.toLocaleString('id-ID')}` : ''}{s.duration ? ` · ${s.duration}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button onClick={() => toggleActive(s)} style={{
                  padding: '0.25rem 0.7rem', borderRadius: 999, fontSize: '0.7rem', border: '1px solid',
                  background: s.is_active ? 'hsl(152 40% 92%)' : 'hsl(0 0% 95%)',
                  color: s.is_active ? 'hsl(152 55% 35%)' : 'hsl(0 0% 55%)',
                  borderColor: s.is_active ? 'hsl(152 40% 82%)' : 'hsl(0 0% 85%)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  {s.is_active ? 'Aktif' : 'Nonaktif'}
                </button>
                <button onClick={() => startEdit(s)} style={{ background: 'none', border: '1px solid hsl(197 30% 88%)', borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: 'hsl(197 45% 38%)' }}>Edit</button>
                <button onClick={() => remove(s)} style={{ background: 'none', border: 'none', color: 'hsl(0 65% 55%)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem' }}>Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
