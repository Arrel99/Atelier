import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { OrderWithBrief, OrderWithCreator, Brief } from '@/types'

type AnyOrder = OrderWithBrief | OrderWithCreator

export default function OrderCard({ order }: { order: AnyOrder }) {
  const title =
    'briefs' in order && order.briefs
      ? (order.briefs as Brief).project_title
      : 'creator_profiles' in order && order.creator_profiles
      ? order.creator_profiles.display_name
      : 'Pesanan'

  const subtitle =
    'creator_profiles' in order && order.creator_profiles
      ? `Kreator: ${order.creator_profiles.display_name}`
      : null

  const stage = order.tracker_stages?.[order.current_stage_index]

  return (
    <Link
      href={`/orders/${order.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '1.1rem 1.25rem',
          transition: 'box-shadow 0.15s, border-color 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.boxShadow = 'var(--shadow-sm)'
          el.style.borderColor = '#87CEEB'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.boxShadow = 'none'
          el.style.borderColor = 'var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Left */}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.2rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </p>
            {subtitle && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                {subtitle}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge status={order.status} />
              {stage && (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    paddingLeft: '0.5rem',
                    borderLeft: '1px solid var(--color-border)',
                  }}
                >
                  {stage}
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.2rem',
              }}
            >
              Rp{formatCurrency(order.total_amount)}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
