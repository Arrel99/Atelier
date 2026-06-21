'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PERKS = [
  'Badge Verified di profil publik',
  'Muncul di direktori kreator',
  'Akses dashboard slot penuh',
  'Bisa membuat hingga 10 slot per bulan',
]

export default function ProbationPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [status, setStatus] = useState({ probation_completed: false, total_done: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: cp } = await supabase
        .from('creator_profiles')
        .select('probation_completed, probation_orders_done')
        .eq('user_id', user.id).single()
      if (cp) setStatus({ probation_completed: cp.probation_completed, total_done: cp.probation_orders_done || 0 })
      setLoading(false)
    }
    load()
  }, [supabase])

  const remaining = Math.max(0, 3 - status.total_done)
  const progress  = Math.min(100, Math.round((status.total_done / 3) * 100))

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #87CEEB', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
            ← Dashboard
          </Link>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: status.probation_completed ? 'hsl(152 40% 92%)' : 'hsl(197 72% 93%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            {status.probation_completed ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="hsl(152 55% 40%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#87CEEB" strokeWidth="2"/>
                <path d="M12 8v4l2.5 2.5" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-headline)', fontSize: '1.4rem', fontWeight: 700,
            letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)', marginBottom: '0.3rem',
          }}>
            Masa Probation
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'hsl(197 20% 50%)' }}>
            Selesaikan 3 order pertama untuk membuka akses penuh.
          </p>
        </div>

        {status.probation_completed ? (
          /* ── Completed ─────────────────────────── */
          <div style={{
            background: 'hsl(152 40% 92%)', border: '1px solid hsl(152 40% 82%)',
            borderRadius: 14, padding: '2rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(152 50% 30%)', marginBottom: '0.5rem' }}>
              ✓ Probation Selesai!
            </p>
            <p style={{ fontSize: '0.85rem', color: 'hsl(152 40% 40%)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Akunmu sudah terverifikasi. Semua fitur kreator sudah aktif.
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-block', padding: '0.65rem 1.5rem',
              background: 'hsl(152 55% 40%)', color: '#fff', borderRadius: 999,
              fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
            }}>
              Kembali ke Dashboard
            </Link>
          </div>
        ) : (
          /* ── In progress ─────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Progress card */}
            <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(197 45% 38%)', lineHeight: 1, fontFamily: 'var(--font-headline)' }}>
                    {status.total_done}<span style={{ fontSize: '1rem', color: 'hsl(197 20% 55%)', marginLeft: '0.2rem' }}>/3</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(197 20% 55%)', marginTop: '0.25rem' }}>order selesai</p>
                </div>
                <p style={{ fontSize: '0.85rem', color: remaining > 0 ? 'hsl(35 60% 45%)' : 'hsl(152 50% 40%)' }}>
                  {remaining > 0 ? `${remaining} order lagi` : 'Selesai!'}
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: 'hsl(197 30% 90%)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`, borderRadius: 999,
                  background: progress >= 100 ? 'hsl(152 55% 45%)' : '#87CEEB',
                  transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Step dots */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', padding: '0 2px' }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: status.total_done >= n ? '#87CEEB' : 'hsl(197 30% 90%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700,
                      color: status.total_done >= n ? '#fff' : 'hsl(197 20% 65%)',
                      transition: 'all 0.3s',
                    }}>
                      {status.total_done >= n ? '✓' : n}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'hsl(197 20% 60%)' }}>Order {n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div style={{ background: 'hsl(197 50% 97%)', border: '1px solid hsl(197 30% 88%)', borderRadius: 14, padding: '1.25rem' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'hsl(197 20% 30%)', marginBottom: '0.75rem' }}>
                Yang akan kamu dapatkan:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {PERKS.map((perk) => (
                  <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'hsl(197 72% 93%)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5 6.5 2" stroke="#87CEEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(197 20% 40%)', lineHeight: 1.4 }}>{perk}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard" style={{
              display: 'block', textAlign: 'center',
              padding: '0.75rem', background: 'hsl(197 45% 38%)',
              color: '#fff', borderRadius: 999,
              fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
            }}>
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
