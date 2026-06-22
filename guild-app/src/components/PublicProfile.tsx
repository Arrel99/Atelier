'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRIEF_TEMPLATES } from '@/lib/constants'
import { formatCurrency, calcCompletenessScore } from '@/lib/format'
import Avatar from '@/components/ui/Avatar'
import PortfolioGallery from '@/components/PortfolioGallery'
import type { CreatorProfile, Slot } from '@/types'

interface ProfileWithBadges extends CreatorProfile {
  reputation_badges?: { badge_type: string; id: string }[]
}

const inputSx: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
  fontSize: '0.875rem', color: 'hsl(197 20% 12%)',
  background: '#fff', outline: 'none', fontFamily: 'var(--font-body)',
  transition: 'border-color 0.12s',
}

const labelSx: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 500, color: 'hsl(197 20% 45%)',
  display: 'block', marginBottom: '0.35rem',
}

export default function PublicProfile({
  profile, slots, remainingSlots,
}: {
  profile: ProfileWithBadges
  slots: Slot[]
  remainingSlots: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const template = BRIEF_TEMPLATES[category] ?? []
  const score = calcCompletenessScore(answers, template)

  const handleFieldChange = (fieldId: string, value: string) =>
    setAnswers(prev => ({ ...prev, [fieldId]: value }))

  const handleJoinWaitlist = async (slotId: string) => {
    setWaitlistLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const res = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_config_id: slotId }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error) }
    else { const d = await res.json(); setSuccess(`Kamu masuk antrean posisi ${d.position}.`) }
    setWaitlistLoading(false)
  }

  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (score < 70) { setError(`Skor kelengkapan ${score}%. Minimal 70%.`); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const slot = slots[0]
    if (!slot) { setError('Tidak ada slot tersedia.'); return }
    setSubmitting(true)
    const { data: order, error: oe } = await supabase.from('orders').insert({
      creator_id: profile.id, client_id: user.id,
      slot_id: slot.id, slot_config_id: slot.id,
      status: 'BRIEF_PENDING', total_amount: slot.price,
      down_payment: Math.round(slot.price * 0.5),
    }).select().single()
    if (oe) { setError(oe.message); setSubmitting(false); return }
    const { error: be } = await supabase.from('briefs').insert({
      order_id: order.id, project_title: projectTitle, description,
      category, completeness_score: score, fields: answers, answers,
    })
    setSubmitting(false)
    if (be) { setError(be.message); return }
    setSuccess('Brief berhasil dikirim! Kreator akan merespons dalam 1×24 jam.')
    setShowForm(false); setProjectTitle(''); setDescription(''); setCategory(''); setAnswers({})
  }

  const tierColors: Record<string, string> = {
    regular: 'hsl(197 72% 93%)',
    rush:    'hsl(35 80% 91%)',
    waitlist:'hsl(270 40% 93%)',
  }
  const tierText: Record<string, string> = {
    regular: 'hsl(197 45% 38%)',
    rush:    'hsl(35 60% 40%)',
    waitlist:'hsl(270 50% 50%)',
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <Link href="/creators" style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)', textDecoration: 'none', display: 'block', marginBottom: '1.75rem' }}>
        ← Semua Kreator
      </Link>

      {/* ── Profile header ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <Avatar name={profile.display_name} src={profile.avatar_url} size={72} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
              fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)',
            }}>
              {profile.display_name}
            </h1>
            {profile.is_verified && (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Kreator Terverifikasi">
                <title>Kreator Terverifikasi</title>
                <circle cx="9" cy="9" r="9" fill="#87CEEB"/>
                <path d="M5.5 9l2.5 2.5 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'hsl(197 20% 50%)', marginBottom: '0.5rem' }}>{profile.category}</p>
          {profile.bio && (
            <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 35%)', lineHeight: 1.65 }}>{profile.bio}</p>
          )}
          {profile.reputation_badges && profile.reputation_badges.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
              {profile.reputation_badges.map(b => (
                <span key={b.id} style={{
                  padding: '0.18rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 500,
                  background: 'hsl(35 80% 91%)', color: 'hsl(35 60% 40%)',
                }}>{b.badge_type}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '2rem',
      }}>
        {[
          { label: 'Tepat Waktu', value: `${profile.on_time_rate}%` },
          { label: 'Klien Setia', value: `${profile.repeat_client_rate}%` },
          { label: 'Akurasi Brief', value: `${profile.brief_accuracy_score}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 10,
            padding: '0.85rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'hsl(197 45% 38%)', fontFamily: 'var(--font-headline)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.7rem', color: 'hsl(197 20% 55%)', marginTop: '0.25rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Slots ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.05rem', fontWeight: 700, color: 'hsl(197 20% 12%)' }}>
            Slot Tersedia
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'hsl(197 20% 55%)' }}>
            {remainingSlots} / {profile.max_slots} slot tersisa
          </span>
        </div>

        {slots.length === 0 || remainingSlots <= 0 ? (
          <div style={{
            padding: '1.5rem', textAlign: 'center',
            border: '1px dashed hsl(197 30% 82%)', borderRadius: 10,
            background: 'hsl(197 50% 98%)',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 50%)', marginBottom: '1rem' }}>
              Slot bulan ini penuh. Masuk waitlist untuk mendapat notifikasi.
            </p>
            {slots.length > 0 && (
              <button
                onClick={() => handleJoinWaitlist(slots[0].id)}
                disabled={waitlistLoading}
                style={{
                  padding: '0.6rem 1.4rem', background: 'transparent',
                  border: '1.5px solid #87CEEB', borderRadius: 999,
                  color: 'hsl(197 45% 38%)', fontSize: '0.82rem', fontWeight: 500,
                  cursor: waitlistLoading ? 'not-allowed' : 'pointer',
                  opacity: waitlistLoading ? 0.6 : 1, fontFamily: 'var(--font-body)',
                }}
              >
                {waitlistLoading ? 'Memproses…' : 'Masuk Waitlist'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {slots.map((slot) => (
              <div key={slot.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    padding: '0.18rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                    background: tierColors[slot.tier] ?? 'hsl(197 72% 93%)',
                    color: tierText[slot.tier] ?? 'hsl(197 45% 38%)',
                    textTransform: 'capitalize',
                  }}>
                    {slot.tier}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(197 20% 45%)' }}>{slot.month}</span>
                  {slot.label && (
                    <span style={{ fontSize: '0.75rem', color: 'hsl(197 20% 60%)' }}>({slot.label})</span>
                  )}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(197 20% 15%)' }}>
                  Rp{formatCurrency(slot.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Alerts ───────────────────────────────────────── */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem',
          background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)',
          borderRadius: 8, fontSize: '0.85rem', color: 'hsl(0 65% 45%)',
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem',
          background: 'hsl(152 55% 40% / 0.07)', border: '1px solid hsl(152 55% 40% / 0.2)',
          borderRadius: 8, fontSize: '0.85rem', color: 'hsl(152 50% 35%)',
        }}>{success}</div>
      )}

      {/* ── Portfolio ────────────────────────────────────── */}
      <PortfolioGallery creatorId={profile.id} />

      {/* ── CTA: open brief form ─────────────────────────── */}
      {remainingSlots > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: '0.85rem',
            background: 'hsl(197 45% 38%)', color: '#fff',
            border: 'none', borderRadius: 999,
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'background 0.12s',
          }}
        >
          Ajukan Brief Pesanan
        </button>
      )}

      {/* ── Brief form ───────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmitBrief} style={{
          background: '#fff', border: '1px solid hsl(197 30% 88%)',
          borderRadius: 14, padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.05rem', fontWeight: 700, color: 'hsl(197 20% 12%)' }}>
              Form Brief
            </h2>
            <button type="button" onClick={() => setShowForm(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'hsl(197 20% 55%)', fontSize: '1.1rem', lineHeight: 1,
            }}>×</button>
          </div>

          {/* Completeness bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'hsl(197 20% 45%)' }}>Kelengkapan Brief</span>
              <span style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: score >= 70 ? 'hsl(152 55% 40%)' : 'hsl(35 60% 45%)',
              }}>{score}%</span>
            </div>
            <div style={{ height: 5, background: 'hsl(197 30% 90%)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${score}%`, borderRadius: 999,
                background: score >= 70 ? 'hsl(152 55% 45%)' : '#87CEEB',
                transition: 'width 0.3s ease',
              }} />
            </div>
            {score < 70 && (
              <p style={{ fontSize: '0.7rem', color: 'hsl(35 60% 45%)', marginTop: '0.3rem' }}>
                Isi lebih banyak field untuk mencapai minimal 70%.
              </p>
            )}
          </div>

          {/* Judul proyek */}
          <div>
            <label htmlFor="brief-title" style={labelSx}>Judul Proyek</label>
            <input id="brief-title" type="text" value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)} required
              placeholder="cth: Ilustrasi karakter OC saya"
              style={inputSx}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="brief-desc" style={labelSx}>Deskripsi Singkat</label>
            <textarea id="brief-desc" value={description}
              onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Ceritakan ide proyek kamu secara singkat..."
              style={{ ...inputSx, resize: 'vertical', minHeight: 80 }}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
            />
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="brief-cat" style={labelSx}>Kategori Jasa</label>
            <select id="brief-cat" value={category}
              onChange={e => setCategory(e.target.value)} required
              style={{ ...inputSx, cursor: 'pointer' }}
            >
              <option value="">Pilih kategori...</option>
              <option value="illustration">Ilustrasi</option>
              <option value="logo">Desain Logo</option>
              <option value="video">Edit Video</option>
            </select>
          </div>

          {/* Dynamic template fields */}
          {template.map(field => (
            <div key={field.id}>
              <label style={labelSx}>{field.label}</label>
              {field.type === 'select' ? (
                <select value={answers[field.id] ?? ''} onChange={e => handleFieldChange(field.id, e.target.value)} style={{ ...inputSx, cursor: 'pointer' }}>
                  <option value="">Pilih...</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={answers[field.id] ?? ''} onChange={e => handleFieldChange(field.id, e.target.value)}
                  rows={2} style={{ ...inputSx, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                  onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
                />
              ) : (
                <input type={field.type} value={answers[field.id] ?? ''} onChange={e => handleFieldChange(field.id, e.target.value)}
                  style={inputSx}
                  onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                  onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
                />
              )}
              {field.hint && <p style={{ fontSize: '0.7rem', color: 'hsl(197 20% 60%)', marginTop: '0.25rem' }}>{field.hint}</p>}
            </div>
          ))}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
            <button type="submit" disabled={submitting} style={{
              flex: 1, padding: '0.75rem',
              background: submitting ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
              color: '#fff', border: 'none', borderRadius: 999,
              fontSize: '0.875rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {submitting ? 'Mengirim…' : 'Kirim Brief'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              padding: '0.75rem 1.25rem', background: 'transparent',
              border: '1px solid hsl(197 30% 88%)', borderRadius: 999,
              fontSize: '0.875rem', color: 'hsl(197 20% 45%)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
