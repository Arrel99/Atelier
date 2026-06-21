'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TOS_ITEMS = [
  'Kreator memiliki hak untuk menolak atau menerima pesanan berdasarkan brief yang diajukan.',
  'Pembayaran dilakukan melalui sistem escrow untuk melindungi kedua belah pihak.',
  'Revisi dibatasi sesuai kesepakatan awal. Revisi tambahan dapat dikenakan biaya.',
  'Dana akan otomatis dicairkan ke kreator jika tidak ada respons dalam 5 hari kerja setelah final review.',
  'Sengketa akan diselesaikan oleh admin platform dengan keputusan yang mengikat.',
  'Konten yang melanggar hukum atau hak cipta tidak diperbolehkan.',
]

export default function ClientOnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({ tos_accepted_at: new Date().toISOString(), onboarding_completed: true }).eq('id', user.id)
    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', background: 'var(--color-bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{
            fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 700,
            fontStyle: 'italic', color: 'hsl(197 20% 12%)', textDecoration: 'none',
          }}>Atelier</Link>
          <p style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'hsl(197 20% 55%)' }}>
            Satu langkah lagi
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {['Daftar', 'Ketentuan', 'Mulai'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: i === 1 ? '#87CEEB' : i < 1 ? 'hsl(197 45% 38%)' : 'hsl(197 30% 88%)',
                fontSize: '0.65rem', fontWeight: 700,
                color: i <= 1 ? '#fff' : 'hsl(197 20% 55%)',
              }}>
                {i < 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', color: i === 1 ? 'hsl(197 20% 20%)' : 'hsl(197 20% 60%)' }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 20, height: 1, background: 'hsl(197 30% 88%)' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 14,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
            <h1 style={{
              fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700,
              letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)',
            }}>
              Ketentuan Penggunaan
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'hsl(197 20% 50%)', marginTop: '0.25rem' }}>
              Baca dan setujui sebelum menggunakan platform.
            </p>
          </div>

          {/* TOS scroll box */}
          <div style={{
            padding: '1.25rem 1.5rem',
            maxHeight: 260, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {TOS_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.65rem' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'hsl(197 20% 35%)', lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '1.1rem 1.5rem', borderTop: '1px solid hsl(197 30% 93%)' }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
              cursor: 'pointer', marginBottom: '1rem',
            }}>
              <div
                onClick={() => setAgreed(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${agreed ? '#87CEEB' : 'hsl(197 30% 80%)'}`,
                  background: agreed ? '#87CEEB' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', marginTop: 2, transition: 'all 0.12s',
                }}
              >
                {agreed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'hsl(197 20% 30%)', lineHeight: 1.5 }}>
                Saya telah membaca dan menyetujui semua ketentuan di atas.
              </span>
            </label>

            <button
              disabled={!agreed || loading}
              onClick={handleAccept}
              style={{
                width: '100%', padding: '0.8rem',
                background: !agreed ? 'hsl(197 30% 88%)' : 'hsl(197 45% 38%)',
                color: !agreed ? 'hsl(197 20% 55%)' : '#fff',
                border: 'none', borderRadius: 999,
                fontSize: '0.875rem', fontWeight: 500,
                cursor: !agreed || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s', fontFamily: 'var(--font-body)',
              }}
            >
              {loading ? 'Memproses…' : 'Lanjutkan ke Platform →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
