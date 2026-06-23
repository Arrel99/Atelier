'use client'

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

export default function CreatorCard({ creator }: { creator: CreatorItem }) {
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
