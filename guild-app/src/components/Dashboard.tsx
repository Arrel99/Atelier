'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Brief, CreatorProfile, OrderWithBrief, OrderWithCreator } from '@/types'

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid hsl(197 30% 88%)',
      borderRadius: 12,
      padding: '1.1rem 1.25rem',
    }}>
      <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(197 20% 12%)', lineHeight: 1, fontFamily: 'var(--font-headline)' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'hsl(197 20% 45%)', marginTop: '0.3rem' }}>{label}</p>
      {sub && <p style={{ fontSize: '0.7rem', color: 'hsl(197 20% 60%)', marginTop: '0.1rem' }}>{sub}</p>}
    </div>
  )
}

/* ── Order row (single card) ─────────────────────────── */
function OrderRow({ order }: { order: OrderWithBrief | OrderWithCreator }) {
  const title =
    'briefs' in order && order.briefs ? (order.briefs as Brief).project_title
    : 'creator_profiles' in order && order.creator_profiles ? order.creator_profiles.display_name
    : 'Pesanan'

  const sub =
    'creator_profiles' in order && order.creator_profiles
      ? `Kreator: ${order.creator_profiles.display_name}`
      : null

  return (
    <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1rem', gap: '1rem',
          borderRadius: 10,
          transition: 'background 0.12s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(197 50% 97%)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 12%)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: '0.2rem',
          }}>
            {title}
          </p>
          {sub && <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>{sub}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <StatusBadge status={order.status} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(197 20% 25%)' }}>
            Rp{formatCurrency(order.total_amount)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', minWidth: 60, textAlign: 'right' }}>
            {formatDate(order.created_at)}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.3 }}>
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}

/* ── Section container ───────────────────────────────── */
function Section({ title, orders, emptyText }: {
  title: string
  orders: (OrderWithBrief | OrderWithCreator)[]
  emptyText: string
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid hsl(197 30% 88%)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.9rem 1rem',
        borderBottom: '1px solid hsl(197 30% 93%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>{title}</p>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          background: orders.length > 0 ? 'hsl(197 72% 93%)' : 'hsl(0 0% 95%)',
          color: orders.length > 0 ? 'hsl(197 45% 38%)' : 'hsl(197 20% 55%)',
          padding: '0.15rem 0.55rem', borderRadius: 999,
        }}>
          {orders.length}
        </span>
      </div>
      {orders.length === 0 ? (
        <p style={{ padding: '1rem', fontSize: '0.8rem', color: 'hsl(197 20% 60%)' }}>{emptyText}</p>
      ) : (
        <div style={{ padding: '0.35rem' }}>
          {orders.map(o => <OrderRow key={o.id} order={o} />)}
        </div>
      )}
    </div>
  )
}

/* ── Main Dashboard ──────────────────────────────────── */
export default function Dashboard({
  profile,
  orders,
  clientOrders,
}: {
  profile: CreatorProfile | null
  orders: OrderWithBrief[]
  clientOrders: OrderWithCreator[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const pending  = orders.filter(o => ['PENDING_APPROVAL','BRIEF_PENDING','COUNTER_OFFER'].includes(o.status))
  const active   = orders.filter(o => ['IN_PROGRESS','PAYMENT_PENDING'].includes(o.status))
  const review   = orders.filter(o => ['FINAL_REVIEW','REVISION_REQUESTED'].includes(o.status))
  const archived = orders.filter(o => ['APPROVED','COMPLETED','DECLINED','CANCELLED','DISPUTE'].includes(o.status))

  /* Client-only view */
  if (!profile) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'hsl(197 20% 50%)', marginTop: '0.2rem' }}>Akun Klien</p>
          </div>
          <Link href="/creators" style={{
            padding: '0.5rem 1.1rem', background: 'hsl(197 45% 38%)', color: '#fff',
            borderRadius: 999, fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none',
          }}>
            + Buat Pesanan
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          <StatCard label="Total Pesanan" value={clientOrders.length} />
          <StatCard label="Sedang Berjalan" value={clientOrders.filter(o => o.status === 'IN_PROGRESS').length} />
        </div>

        <Section title="Semua Pesanan Kamu" orders={clientOrders} emptyText="Belum ada pesanan. Jelajahi kreator untuk memulai." />

        <button onClick={handleLogout} style={{
          marginTop: '2rem', padding: '0.5rem 1rem',
          border: '1px solid hsl(197 30% 88%)', borderRadius: 999,
          fontSize: '0.8rem', color: 'hsl(197 20% 45%)',
          background: 'none', cursor: 'pointer',
        }}>
          Keluar
        </button>
      </div>
    )
  }

  /* Creator view */
  const completedCount = archived.filter(o => o.status === 'COMPLETED' || o.status === 'APPROVED').length
  const activeCount    = active.length + review.length

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <Avatar name={profile.display_name} src={profile.avatar_url} size={48} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)' }}>
                {profile.display_name}
              </h1>
              {profile.is_verified && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Verified">
                  <title>Verified</title>
                  <circle cx="8" cy="8" r="8" fill="#87CEEB"/>
                  <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'hsl(197 20% 50%)' }}>
              {profile.category}
              {!profile.probation_completed && (
                <span style={{
                  marginLeft: '0.5rem', padding: '0.1rem 0.5rem',
                  background: 'hsl(35 80% 91%)', color: 'hsl(35 60% 40%)',
                  borderRadius: 999, fontSize: '0.68rem',
                }}>
                  Probation {profile.probation_orders_done || 0}/3
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/slots" style={{
            padding: '0.5rem 1rem', background: 'hsl(197 45% 38%)', color: '#fff',
            borderRadius: 999, fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none',
          }}>Kelola Slot</Link>
          <Link href="/dashboard/settings/stages" style={{
            padding: '0.5rem 1rem', background: 'transparent', color: 'hsl(197 45% 38%)',
            border: '1px solid hsl(197 30% 88%)', borderRadius: 999, fontSize: '0.8rem',
            fontWeight: 500, textDecoration: 'none',
          }}>Tahap Tracker</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '2rem' }}>
        <StatCard label="Perlu Respons" value={pending.length} />
        <StatCard label="Sedang Dikerjakan" value={activeCount} />
        <StatCard label="Selesai" value={completedCount} />
        <StatCard label="Maks Slot" value={profile.max_slots} sub={`Aktif: ${activeCount}`} />
      </div>

      {/* Order sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {pending.length > 0 && (
          <Section title="⚡ Perlu Direspons" orders={pending} emptyText="" />
        )}
        <Section title="Sedang Dikerjakan" orders={active} emptyText="Tidak ada pesanan aktif." />
        <Section title="Menunggu Approve / Revisi" orders={review} emptyText="Tidak ada." />
        <Section title="Pesanan sebagai Klien" orders={clientOrders} emptyText="Kamu belum pernah memesan jasa." />
        {archived.length > 0 && (
          <Section title="Riwayat" orders={archived} emptyText="" />
        )}
      </div>

      <button onClick={handleLogout} style={{
        padding: '0.5rem 1rem', border: '1px solid hsl(197 30% 88%)',
        borderRadius: 999, fontSize: '0.8rem', color: 'hsl(197 20% 50%)',
        background: 'none', cursor: 'pointer',
      }}>
        Keluar
      </button>
    </div>
  )
}
