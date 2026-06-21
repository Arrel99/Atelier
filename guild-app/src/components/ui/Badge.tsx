import type { OrderStatus } from '@/types'

type BadgeVariant = 'sky' | 'muted' | 'success' | 'error' | 'warning'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  sky:     'bg-[var(--color-sky-pale)] text-[var(--color-sky-dark)]',
  muted:   'bg-[var(--color-muted)] text-[var(--text-secondary)]',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  error:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
}

export default function Badge({
  children,
  variant = 'muted',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center',
        'rounded-[var(--radius-pill)]',
        'px-2.5 py-0.5',
        'text-xs font-medium',
        'leading-none whitespace-nowrap',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

/* ── Status badge khusus untuk OrderStatus ─────────────────── */

const STATUS_VARIANT: Partial<Record<OrderStatus, BadgeVariant>> = {
  IN_PROGRESS:        'sky',
  FINAL_REVIEW:       'sky',
  REVISION_REQUESTED: 'warning',
  PAYMENT_PENDING:    'warning',
  COUNTER_OFFER:      'warning',
  COMPLETED:          'success',
  APPROVED:           'success',
  DISPUTE:            'error',
  DECLINED:           'error',
  CANCELLED:          'muted',
  BRIEF_PENDING:      'muted',
  PENDING_APPROVAL:   'muted',
}

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  BRIEF_PENDING:      'Brief Baru',
  PENDING_APPROVAL:   'Perlu Respons',
  COUNTER_OFFER:      'Negosiasi',
  PAYMENT_PENDING:    'Menunggu Bayar',
  IN_PROGRESS:        'Dikerjakan',
  REVISION_REQUESTED: 'Revisi',
  FINAL_REVIEW:       'Review Final',
  APPROVED:           'Disetujui',
  COMPLETED:          'Selesai',
  DECLINED:           'Ditolak',
  DISPUTE:            'Sengketa',
  CANCELLED:          'Dibatalkan',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'muted'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
