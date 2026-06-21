import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import type { CreatorProfile } from '@/types'

interface CreatorCardProps {
  profile: CreatorProfile & { username?: string }
  remainingSlots?: number
}

export default function CreatorCard({ profile, remainingSlots }: CreatorCardProps) {
  const href = profile.username ? `/${profile.username}` : `/creators/${profile.user_id}`

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '1.25rem',
          transition: 'box-shadow 0.15s, border-color 0.15s',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.borderColor = '#87CEEB'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
          <Avatar src={profile.avatar_url} name={profile.display_name} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile.display_name}
              </p>
              {profile.is_verified && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Verified">
                  <circle cx="7" cy="7" r="7" fill="#87CEEB" />
                  <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {profile.category}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '0.9rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '0.9rem',
          }}
        >
          {[
            { label: 'Tepat Waktu', value: `${profile.on_time_rate}%` },
            { label: 'Klien Setia', value: `${profile.repeat_client_rate}%` },
            { label: 'Akurasi', value: `${profile.brief_accuracy_score}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-sky-dark)',
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Slot availability */}
        {remainingSlots !== undefined && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.4rem 0.75rem',
              background: remainingSlots > 0 ? 'var(--color-sky-pale)' : 'var(--color-muted)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              color: remainingSlots > 0 ? 'var(--color-sky-dark)' : 'var(--text-tertiary)',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {remainingSlots > 0 ? `${remainingSlots} slot tersedia` : 'Slot penuh — buka waitlist'}
          </div>
        )}
      </div>
    </Link>
  )
}
