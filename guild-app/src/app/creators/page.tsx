import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'

interface CreatorBadge { id: string; badge_type: string }
interface CreatorUser  { full_name: string; avatar_url: string | null }
interface CreatorItem {
  id: string
  display_name: string
  bio: string | null
  category: string
  is_verified: boolean
  on_time_rate: number
  repeat_client_rate: number
  brief_accuracy_score: number
  max_slots: number
  users: CreatorUser | null
  reputation_badges?: CreatorBadge[]
}

export const metadata = {
  title: 'Kreator — Atelier',
  description: 'Temukan kreator ilustrasi, desain, dan aset visual terbaik di Indonesia.',
}

const CATEGORIES = ['Semua', 'Illustration', 'Design', 'Character', 'Logo', 'Animation', 'Vtuber']

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase
    .from('creator_profiles')
    .select(`*, users!inner(full_name, avatar_url), reputation_badges(badge_type)`)
    .eq('is_verified', true)
    .order('on_time_rate', { ascending: false })

  const list = (creators ?? []) as CreatorItem[]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* ── Page header ─────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontWeight: 700, letterSpacing: '-0.02em',
          color: 'hsl(197 20% 12%)', marginBottom: '0.4rem',
        }}>
          Ilustrator &amp; Desainer
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 50%)' }}>
          {list.length} kreator terverifikasi siap menerima pesanan
        </p>
      </div>

      {/* ── Category filter pills ───────────────────────── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map((cat, i) => (
          <span key={cat} style={{
            padding: '0.35rem 0.9rem', borderRadius: 999,
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
            background: i === 0 ? '#87CEEB' : 'hsl(0 0% 96%)',
            color: i === 0 ? 'hsl(197 25% 12%)' : 'hsl(197 20% 45%)',
            border: `1px solid ${i === 0 ? '#87CEEB' : 'hsl(197 30% 88%)'}`,
            transition: 'all 0.12s',
          }}>
            {cat}
          </span>
        ))}
      </div>

      {/* ── Grid ────────────────────────────────────────── */}
      {list.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'hsl(197 20% 55%)', fontSize: '0.875rem',
        }}>
          Belum ada kreator terverifikasi.{' '}
          <Link href="/auth/register" style={{ color: 'hsl(197 45% 38%)', textDecoration: 'none' }}>
            Daftar sebagai kreator →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {list.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  )
}

function CreatorCard({ creator }: { creator: CreatorItem }) {
  const avatarSrc = creator.users?.avatar_url ?? null

  return (
    <Link href={`/${creator.display_name}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#fff',
        border: '1px solid hsl(197 30% 88%)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        height: '100%',
      }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.boxShadow = '0 4px 20px hsl(197 30% 20% / 0.08)'
          e.currentTarget.style.borderColor = '#87CEEB'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'hsl(197 30% 88%)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.1rem 1.1rem 0.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Avatar name={creator.display_name} src={avatarSrc} size={44} />
            <div>
              <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginBottom: '0.1rem' }}>
                {creator.category}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'hsl(197 20% 12%)' }}>
                  {creator.display_name}
                </p>
                {creator.is_verified && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Verified">
                    <title>Verified</title>
                    <circle cx="7" cy="7" r="7" fill="#87CEEB"/>
                    <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>

          <span style={{
            fontSize: '0.72rem', fontWeight: 500, padding: '0.2rem 0.6rem',
            borderRadius: 999,
            background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)',
          }}>
            Order →
          </span>
        </div>

        {/* Bio */}
        {creator.bio && (
          <div style={{ padding: '0 1.1rem 0.75rem' }}>
            <p style={{
              fontSize: '0.82rem', color: 'hsl(197 15% 40%)', lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {creator.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          padding: '0.75rem 1.1rem',
          background: 'hsl(197 50% 97%)',
          gap: '0.5rem',
        }}>
          {[
            { label: 'Tepat Waktu', value: `${creator.on_time_rate}%` },
            { label: 'Klien Setia', value: `${creator.repeat_client_rate}%` },
            { label: 'Akurasi', value: `${creator.brief_accuracy_score}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(197 45% 38%)' }}>{value}</p>
              <p style={{ fontSize: '0.65rem', color: 'hsl(197 20% 55%)', marginTop: '0.1rem' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Badges + slots */}
        <div style={{
          padding: '0.65rem 1.1rem',
          borderTop: '1px solid hsl(197 30% 93%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {creator.reputation_badges?.slice(0, 2).map(b => (
              <span key={b.id} style={{
                padding: '0.18rem 0.6rem', borderRadius: 999, fontSize: '0.68rem', fontWeight: 500,
                background: 'hsl(35 80% 91%)', color: 'hsl(35 60% 40%)',
              }}>
                {b.badge_type}
              </span>
            ))}
            {(!creator.reputation_badges || creator.reputation_badges.length === 0) && (
              <span style={{
                padding: '0.18rem 0.6rem', borderRadius: 999, fontSize: '0.68rem',
                background: 'hsl(0 0% 95%)', color: 'hsl(197 20% 55%)',
              }}>
                {creator.category}
              </span>
            )}
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 500, padding: '0.18rem 0.6rem', borderRadius: 999,
            background: 'hsl(152 40% 92%)', color: 'hsl(152 55% 35%)',
          }}>
            Maks {creator.max_slots} slot
          </span>
        </div>
      </div>
    </Link>
  )
}
