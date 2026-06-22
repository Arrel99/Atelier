'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface FormField {
  id?: string
  form_id?: string
  label: string
  type: string
  required: boolean
  options: string | null
  display_order: number
}

interface CustomForm {
  id: string
  creator_id: string
  title: string
  category: string
  description: string | null
  is_active: boolean
  created_at: string
  fields: FormField[]
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

const CATEGORIES = ['request', 'commission', 'portfolio', 'contact', 'other']

const FIELD_TYPES = ['text', 'textarea', 'select', 'number', 'file', 'email', 'tel']

export default function FormsSettingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [forms, setForms] = useState<CustomForm[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('request')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([{ label: '', type: 'text', required: false, options: null, display_order: 0 }])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      loadForms()
    }
    init()
  }, [supabase])

  async function loadForms() {
    setLoading(true)
    const res = await fetch('/api/creator/forms')
    if (res.ok) setForms(await res.json())
    setLoading(false)
  }

  function resetForm() {
    setTitle(''); setCategory('request'); setDescription('')
    setFields([{ label: '', type: 'text', required: false, options: null, display_order: 0 }])
    setEditingId(null); setError('')
  }

  function addField() {
    setFields([...fields, { label: '', type: 'text', required: false, options: null, display_order: fields.length }])
  }

  function removeField(i: number) {
    setFields(fields.filter((_, idx) => idx !== i))
  }

  function updateField(i: number, key: keyof FormField, value: any) {
    const f = [...fields]
    ;(f[i] as any)[key] = value
    setFields(f)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    const body = { title, category, description: description || null, fields: fields.filter(f => f.label.trim()) }

    const url = editingId ? `/api/creator/forms/${editingId}` : '/api/creator/forms'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setError(j.error); return }
    resetForm()
    loadForms()
    router.refresh()
  }

  function startEdit(form: CustomForm) {
    setTitle(form.title); setCategory(form.category); setDescription(form.description ?? '')
    setFields(form.fields.length ? form.fields.map(f => ({ ...f })) : [{ label: '', type: 'text', required: false, options: null, display_order: 0 }])
    setEditingId(form.id)
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', marginBottom: '1rem' }}>
        Formulir Kustom
      </h2>

      {/* Form editor */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>
            {editingId ? 'Edit Formulir' : 'Buat Formulir Baru'}
          </p>
        </div>
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)' }}>{error}</div>
          )}

          <div>
            <label style={labelSx}>Judul</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Nama formulir" style={inputSx}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>

          <div>
            <label style={labelSx}>Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputSx}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelSx}>Deskripsi (opsional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Keterangan formulir" style={inputSx}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>

          {/* Fields editor */}
          <div>
            <label style={{ ...labelSx, marginBottom: '0.6rem' }}>Bidang (Fields)</label>
            {fields.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input value={f.label} onChange={e => updateField(i, 'label', e.target.value)} placeholder={`Bidang ${i + 1}`}
                  style={{ ...inputSx, width: 180 }} />
                <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)} style={{ ...inputSx, width: 110 }}>
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label style={{ ...labelSx, margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                  <input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} />
                  Wajib
                </label>
                {f.type === 'select' && (
                  <input value={f.options ?? ''} onChange={e => updateField(i, 'options', e.target.value)} placeholder="opsi1,opsi2"
                    style={{ ...inputSx, width: 150, fontSize: '0.72rem' }} />
                )}
                <button type="button" onClick={() => removeField(i)} style={{ background: 'none', border: 'none', color: 'hsl(0 65% 50%)', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addField} style={{ fontSize: '0.8rem', color: 'hsl(197 45% 38%)', background: 'none', border: '1px dashed hsl(197 30% 88%)', borderRadius: 8, padding: '0.45rem 1rem', cursor: 'pointer', marginTop: '0.3rem' }}>
              + Tambah Bidang
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={{
              padding: '0.65rem 1.5rem', background: saving ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
              color: '#fff', border: 'none', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {saving ? 'Menyimpan…' : editingId ? 'Simpan Perubahan' : 'Buat Formulir'}
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

      {/* Forms list */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Formulir Tersimpan</p>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 999, background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)' }}>{forms.length}</span>
        </div>
        {loading ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Memuat…</p>
        ) : forms.length === 0 ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Belum ada formulir.</p>
        ) : (
          forms.map((f, i) => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid hsl(197 30% 93%)' : undefined,
            }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>{f.title}</p>
                <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
                  {f.category} · {f.fields?.length ?? 0} bidang{f.description ? ` · ${f.description}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 999, background: f.is_active ? 'hsl(152 40% 92%)' : 'hsl(0 0% 95%)', color: f.is_active ? 'hsl(152 55% 35%)' : 'hsl(0 0% 55%)' }}>
                  {f.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <button onClick={() => startEdit(f)} style={{ background: 'none', border: '1px solid hsl(197 30% 88%)', borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: 'hsl(197 45% 38%)' }}>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
