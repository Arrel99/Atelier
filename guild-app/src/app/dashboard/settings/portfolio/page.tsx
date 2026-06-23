'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CreatorPortfolio {
  id: string
  creator_id: string
  title: string
  description: string | null
  image_url: string
  project_url: string | null
  status: 'draft' | 'published'
  display_order: number
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

export default function PortfolioSettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  
  const [portfolios, setPortfolios] = useState<CreatorPortfolio[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [file, setFile] = useState<File | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      loadPortfolios()
    }
    init()
  }, [supabase, router])

  async function loadPortfolios() {
    setLoading(true)
    try {
      const res = await fetch('/api/creator/portfolio')
      if (res.ok) {
        setPortfolios(await res.json())
      }
    } catch (err) {
      console.error('Error loading portfolios:', err)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setProjectUrl('')
    setStatus('published')
    setFile(null)
    setError('')
    // Reset file input element
    const fileInput = document.getElementById('portfolio-file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Pilih file gambar untuk portofolio kamu.')
      return
    }

    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('project_url', projectUrl)
      formData.append('status', status)

      const res = await fetch('/api/creator/portfolio', {
        method: 'POST',
        body: formData,
      })

      setSaving(false)

      if (!res.ok) {
        const j = await res.json()
        setError(j.error || 'Gagal menyimpan portofolio.')
        return
      }

      setSuccess('Portofolio berhasil ditambahkan!')
      resetForm()
      loadPortfolios()
      router.refresh()
    } catch (err: unknown) {
      setSaving(false)
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setError(message)
    }
  }

  async function toggleStatus(item: CreatorPortfolio) {
    setError('')
    setSuccess('')
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    
    try {
      const res = await fetch(`/api/creator/portfolio/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const j = await res.json()
        setError(j.error || 'Gagal mengubah status.')
        return
      }

      loadPortfolios()
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah status.'
      setError(message)
    }
  }

  async function remove(item: CreatorPortfolio) {
    if (!confirm(`Hapus portofolio "${item.title}"?`)) return
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/creator/portfolio/${item.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const j = await res.json()
        setError(j.error || 'Gagal menghapus portofolio.')
        return
      }

      setSuccess('Portofolio berhasil dihapus.')
      loadPortfolios()
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus portofolio.'
      setError(message)
    }
  }

  return (
    <div style={{ maxWidth: 750 }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', marginBottom: '1rem' }}>
        Portofolio &amp; Media Promosi
      </h2>

      {/* Upload Form */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>
            Tambah Portofolio / Media Baru
          </p>
        </div>
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)' }}>{error}</div>
          )}
          {success && (
            <div style={{ padding: '0.65rem 0.9rem', background: 'hsl(152 55% 40% / 0.07)', border: '1px solid hsl(152 55% 40% / 0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'hsl(152 50% 35%)' }}>{success}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelSx}>Judul Karya</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="cth: Desain Karakter Vtuber" style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
            <div>
              <label style={labelSx}>Status Publikasi</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')} style={inputSx}>
                <option value="published">Published (Tampil di Profil)</option>
                <option value="draft">Draft (Sembunyikan)</option>
              </select>
            </div>
            <div>
              <label style={labelSx}>URL Proyek / Detail (opsional)</label>
              <input value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://..." style={inputSx}
                onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
            </div>
            <div>
              <label style={labelSx}>File Gambar (Max 10MB)</label>
              <input id="portfolio-file" type="file" accept="image/*" required onChange={e => setFile(e.target.files?.[0] || null)} style={inputSx} />
            </div>
          </div>

          <div>
            <label style={labelSx}>Deskripsi Karya (opsional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Ceritakan detail karya ini..." style={inputSx}
              onFocus={e => e.target.style.borderColor = '#87CEEB'} onBlur={e => e.target.style.borderColor = 'hsl(197 30% 88%)'} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={{
              padding: '0.65rem 1.5rem', background: saving ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
              color: '#fff', border: 'none', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {saving ? 'Mengunggah…' : 'Tambah Portofolio'}
            </button>
          </div>
        </form>
      </div>

      {/* Portfolios Gallery Grid */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Koleksi Portofolio Kamu</p>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 999, background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)' }}>{portfolios.length}</span>
        </div>

        {loading ? (
          <p style={{ padding: '2.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Memuat portofolio…</p>
        ) : portfolios.length === 0 ? (
          <p style={{ padding: '2.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>Belum ada media portofolio yang diunggah.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', padding: '1.25rem' }}>
            {portfolios.map(item => (
              <div key={item.id} style={{
                background: '#fff',
                border: '1px solid hsl(197 30% 91%)',
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ width: '100%', aspectRatio: '1.5', position: 'relative', background: '#f5f5f5' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'hsl(197 20% 15%)', wordBreak: 'break-word' }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p style={{ fontSize: '0.72rem', color: 'hsl(197 15% 45%)', margin: '0 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <button onClick={() => toggleStatus(item)} style={{
                      flex: 1, padding: '0.3rem 0.5rem', borderRadius: 6, fontSize: '0.68rem', border: '1px solid',
                      background: item.status === 'published' ? 'hsl(152 40% 92%)' : 'hsl(0 0% 95%)',
                      color: item.status === 'published' ? 'hsl(152 55% 35%)' : 'hsl(0 0% 55%)',
                      borderColor: item.status === 'published' ? 'hsl(152 40% 82%)' : 'hsl(0 0% 85%)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500
                    }}>
                      {item.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                    <button onClick={() => remove(item)} style={{
                      padding: '0.3rem 0.5rem', background: 'none', border: '1px solid hsl(0 65% 88%)',
                      borderRadius: 6, color: 'hsl(0 65% 55%)', cursor: 'pointer', fontSize: '0.68rem',
                      fontFamily: 'var(--font-body)'
                    }}>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
