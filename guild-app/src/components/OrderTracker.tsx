'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import type { OrderFull, OrderHistory } from '@/types'

/* ── Shared input style ─────────────────────────────── */
const inputSx: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
  fontSize: '0.875rem', color: 'hsl(197 20% 12%)',
  background: '#fff', outline: 'none',
  fontFamily: 'var(--font-body)',
}

const textareaSx: React.CSSProperties = {
  ...inputSx, resize: 'vertical', minHeight: 88,
}

/* ── Action button ──────────────────────────────────── */
function ActionBtn({
  onClick, children, variant = 'primary', disabled,
}: {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.55rem 1.1rem', borderRadius: 999,
    fontSize: '0.82rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.12s', opacity: disabled ? 0.5 : 1,
    fontFamily: 'var(--font-body)',
  }
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'hsl(197 45% 38%)', color: '#fff' },
    ghost:   { background: 'transparent', color: 'hsl(197 45% 38%)', border: '1px solid hsl(197 30% 88%)' },
    danger:  { background: 'transparent', color: 'hsl(0 65% 50%)', border: '1px solid hsl(0 65% 80%)' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...styles[variant] }}>
      {children}
    </button>
  )
}

/* ── Section header ─────────────────────────────────── */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: 'hsl(197 20% 50%)',
      marginBottom: '0.75rem', marginTop: '2rem',
    }}>
      {children}
    </h2>
  )
}

/* ── Card wrapper ───────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid hsl(197 30% 88%)',
      borderRadius: 12, padding: '1.25rem', ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Timeline entry ─────────────────────────────────── */
function TimelineEntry({ entry, isLast }: { entry: OrderHistory; isLast: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.9rem', position: 'relative' }}>
      {/* Dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#87CEEB', marginTop: 4, flexShrink: 0,
        }} />
        {!isLast && <div style={{ width: 1, flex: 1, background: 'hsl(197 30% 88%)', margin: '4px 0' }} />}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '1rem', minWidth: 0 }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'hsl(197 20% 20%)' }}>
          {STATUS_LABELS[entry.to_status] ?? entry.to_status}
        </p>
        <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginTop: '0.1rem' }}>
          {formatDateTime(entry.created_at)}
        </p>
        {entry.notes && (
          <p style={{ fontSize: '0.78rem', color: 'hsl(197 20% 40%)', marginTop: '0.3rem', lineHeight: 1.5 }}>
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function OrderTracker({
  order, history, isClient, isCreator,
}: {
  order: OrderFull
  history: OrderHistory[]
  isClient: boolean
  isCreator: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [showCounterForm, setShowCounterForm] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterDeadline, setCounterDeadline] = useState('')
  const [counterNotes, setCounterNotes] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  /* Real-time poll every 30 s */
  const pollOrder = useCallback(async () => {
    const { data } = await supabase.from('orders').select('status, current_stage_index').eq('id', order.id).single()
    if (data && (data.status !== order.status || data.current_stage_index !== order.current_stage_index)) router.refresh()
  }, [order.id, order.status, order.current_stage_index, supabase, router])

  useEffect(() => {
    const t = setInterval(pollOrder, 30000)
    return () => clearInterval(t)
  }, [pollOrder])

  /* API helpers */
  const api = async (url: string, body: object, key: string) => {
    setError(''); setLoading(key)
    const res = await fetch(url, { method: body ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setLoading(null)
    if (!res.ok) { const d = await res.json(); setError(d.error) }
    else router.refresh()
    return res.ok
  }

  const handleStatusChange = (s: string) => api(`/api/orders/${order.id}/status`, { newStatus: s }, s)
  const handleStageAdvance = () => api(`/api/orders/${order.id}/stage`, { stage_index: order.current_stage_index + 1 }, 'stage')
  const handleAccept   = () => api(`/api/orders/${order.id}/respond`, { action: 'accept' }, 'accept')
  const handleDecline  = () => api(`/api/orders/${order.id}/respond`, { action: 'decline' }, 'decline')
  const handleCounter  = () => api(`/api/orders/${order.id}/respond`, { action: 'counter_offer', counter_data: { proposed_price: parseFloat(counterPrice), proposed_deadline: counterDeadline, scope_notes: counterNotes } }, 'counter')
  const handleCounterRespond = (a: 'accept' | 'reject') => api(`/api/orders/${order.id}/counter-respond`, { action: a }, a)
  const handleRevision = async () => { const ok = await api(`/api/orders/${order.id}/revision`, { feedback: revisionFeedback }, 'revision'); if (ok) { setShowRevisionForm(false); setRevisionFeedback('') } }
  const handleDispute  = async () => { const ok = await api(`/api/orders/${order.id}/dispute`, { reason: disputeReason }, 'dispute'); if (ok) setShowDisputeForm(false) }

  const stageProgress = ((order.current_stage_index + 1) / order.tracker_stages.length) * 100
  const currentStage  = order.tracker_stages[order.current_stage_index] ?? '—'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'hsl(197 20% 50%)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </div>

      {/* ── Order header ────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)',
              marginBottom: '0.4rem',
            }}>
              {order.briefs?.project_title ?? 'Pesanan'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {order.creator_profiles && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Avatar name={order.creator_profiles.display_name} src={order.creator_profiles.avatar_url} size={22} />
                  <span style={{ fontSize: '0.8rem', color: 'hsl(197 20% 45%)' }}>
                    {order.creator_profiles.display_name}
                  </span>
                </div>
              )}
              <StatusBadge status={order.status} />
              {order.auto_release_at && order.status === 'FINAL_REVIEW' && (
                <span style={{ fontSize: '0.72rem', color: 'hsl(35 60% 45%)' }}>
                  Auto-release: {formatDateTime(order.auto_release_at)}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(197 20% 12%)', fontFamily: 'var(--font-headline)' }}>
              Rp{formatCurrency(order.total_amount)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
              DP: Rp{formatCurrency(order.down_payment)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1.25rem',
          background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)',
          borderRadius: 8, fontSize: '0.85rem', color: 'hsl(0 65% 45%)',
        }}>{error}</div>
      )}

      {/* ── Stage progress ───────────────────────────────── */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'hsl(197 20% 30%)' }}>
            Tahap: <span style={{ color: 'hsl(197 45% 38%)' }}>{currentStage}</span>
          </p>
          <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
            {order.current_stage_index + 1} / {order.tracker_stages.length}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'hsl(197 30% 90%)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.9rem' }}>
          <div style={{ height: '100%', width: `${stageProgress}%`, background: '#87CEEB', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>

        {/* Stage pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {order.tracker_stages.map((stage, i) => (
            <span key={stage} style={{
              padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 500,
              background: i < order.current_stage_index ? 'hsl(197 45% 38%)' : i === order.current_stage_index ? '#87CEEB' : 'hsl(197 30% 93%)',
              color: i <= order.current_stage_index ? '#fff' : 'hsl(197 20% 55%)',
            }}>
              {stage}
            </span>
          ))}
        </div>

        {isCreator && order.status === 'IN_PROGRESS' && (
          <div style={{ marginTop: '0.9rem' }}>
            <ActionBtn
              onClick={handleStageAdvance}
              disabled={order.current_stage_index >= order.tracker_stages.length - 1 || loading === 'stage'}
            >
              {loading === 'stage' ? 'Memproses…' : 'Maju ke Tahap Berikutnya →'}
            </ActionBtn>
          </div>
        )}
      </Card>

      {/* ── Actions ─────────────────────────────────────── */}
      <SectionHeader>Aksi</SectionHeader>
      <Card style={{ marginBottom: '1rem' }}>
        {/* BRIEF_PENDING creator */}
        {order.status === 'BRIEF_PENDING' && isCreator && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ActionBtn onClick={handleAccept} disabled={loading === 'accept'}>
              {loading === 'accept' ? 'Memproses…' : '✓ Terima & Lanjut ke Pembayaran'}
            </ActionBtn>
            <ActionBtn onClick={() => setShowCounterForm(v => !v)} variant="ghost">Ajukan Counter-Offer</ActionBtn>
            <ActionBtn onClick={handleDecline} variant="danger" disabled={loading === 'decline'}>Tolak</ActionBtn>
          </div>
        )}

        {/* Counter form */}
        {showCounterForm && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'hsl(197 20% 45%)', display: 'block', marginBottom: '0.3rem' }}>Harga Proposal (Rp)</label>
                <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} style={inputSx} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'hsl(197 20% 45%)', display: 'block', marginBottom: '0.3rem' }}>Deadline</label>
                <input type="date" value={counterDeadline} onChange={e => setCounterDeadline(e.target.value)} style={inputSx} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'hsl(197 20% 45%)', display: 'block', marginBottom: '0.3rem' }}>Catatan scope</label>
              <textarea value={counterNotes} onChange={e => setCounterNotes(e.target.value)} rows={2} style={textareaSx} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionBtn onClick={handleCounter} disabled={loading === 'counter'}>
                {loading === 'counter' ? 'Mengirim…' : 'Kirim Counter-Offer'}
              </ActionBtn>
              <ActionBtn onClick={() => setShowCounterForm(false)} variant="ghost">Batal</ActionBtn>
            </div>
          </div>
        )}

        {/* COUNTER_OFFER client */}
        {order.status === 'COUNTER_OFFER' && isClient && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ActionBtn onClick={() => handleCounterRespond('accept')} disabled={loading === 'accept'}>Setuju Counter-Offer</ActionBtn>
            <ActionBtn onClick={() => handleCounterRespond('reject')} variant="danger" disabled={loading === 'reject'}>Tolak & Batalkan</ActionBtn>
          </div>
        )}

        {/* PAYMENT_PENDING client */}
        {order.status === 'PAYMENT_PENDING' && isClient && (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'hsl(197 20% 45%)', marginBottom: '0.75rem' }}>
              Lakukan pembayaran untuk memulai pengerjaan.
            </p>
            <ActionBtn>Bayar Sekarang — Rp{formatCurrency(order.down_payment)}</ActionBtn>
          </div>
        )}

        {/* IN_PROGRESS creator */}
        {order.status === 'IN_PROGRESS' && isCreator && (
          <ActionBtn onClick={() => handleStatusChange('FINAL_REVIEW')} disabled={loading === 'FINAL_REVIEW'}>
            {loading === 'FINAL_REVIEW' ? 'Mengirim…' : '↑ Kirim File Final untuk Review'}
          </ActionBtn>
        )}

        {/* FINAL_REVIEW client */}
        {order.status === 'FINAL_REVIEW' && isClient && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ActionBtn onClick={() => handleStatusChange('APPROVED')} disabled={loading === 'APPROVED'}>
              {loading === 'APPROVED' ? 'Memproses…' : '✓ Approve & Selesaikan'}
            </ActionBtn>
            <ActionBtn onClick={() => setShowRevisionForm(v => !v)} variant="ghost">Minta Revisi</ActionBtn>
          </div>
        )}

        {/* Revision form */}
        {showRevisionForm && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <textarea
              value={revisionFeedback}
              onChange={e => setRevisionFeedback(e.target.value)}
              rows={3}
              placeholder="Jelaskan apa yang perlu direvisi..."
              style={textareaSx}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionBtn onClick={handleRevision} disabled={loading === 'revision'}>
                {loading === 'revision' ? 'Mengirim…' : 'Kirim Permintaan Revisi'}
              </ActionBtn>
              <ActionBtn onClick={() => setShowRevisionForm(false)} variant="ghost">Batal</ActionBtn>
            </div>
          </div>
        )}

        {/* REVISION_REQUESTED creator */}
        {order.status === 'REVISION_REQUESTED' && isCreator && (
          <ActionBtn onClick={() => handleStatusChange('IN_PROGRESS')} disabled={loading === 'IN_PROGRESS'}>
            Mulai Revisi
          </ActionBtn>
        )}

        {/* Dispute */}
        {['IN_PROGRESS', 'FINAL_REVIEW'].includes(order.status) && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(197 30% 93%)' }}>
            {!showDisputeForm ? (
              <ActionBtn onClick={() => setShowDisputeForm(true)} variant="danger">Ajukan Sengketa</ActionBtn>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <textarea
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan alasan sengketa..."
                  style={{ ...textareaSx, borderColor: 'hsl(0 65% 75%)' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionBtn onClick={handleDispute} variant="danger" disabled={loading === 'dispute'}>
                    {loading === 'dispute' ? 'Mengirim…' : 'Ajukan Sengketa'}
                  </ActionBtn>
                  <ActionBtn onClick={() => setShowDisputeForm(false)} variant="ghost">Batal</ActionBtn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Terminal states */}
        {order.status === 'APPROVED'   && <p style={{ color: 'hsl(152 55% 40%)', fontWeight: 500, fontSize: '0.875rem' }}>✓ Pesanan selesai dan disetujui.</p>}
        {order.status === 'COMPLETED'  && <p style={{ color: 'hsl(152 55% 40%)', fontWeight: 500, fontSize: '0.875rem' }}>✓ Pesanan selesai & dana telah dicairkan.</p>}
        {order.status === 'DECLINED'   && <p style={{ color: 'hsl(0 65% 50%)', fontSize: '0.875rem' }}>Pesanan ditolak oleh kreator.</p>}
        {order.status === 'CANCELLED'  && <p style={{ color: 'hsl(197 20% 50%)', fontSize: '0.875rem' }}>Pesanan dibatalkan.</p>}
        {order.status === 'DISPUTE'    && <p style={{ color: 'hsl(0 65% 50%)', fontSize: '0.875rem' }}>Sengketa sedang ditinjau oleh admin.</p>}
      </Card>

      {/* ── Brief detail ─────────────────────────────────── */}
      {order.briefs && (
        <>
          <SectionHeader>Detail Brief</SectionHeader>
          <Card style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 30%)', lineHeight: 1.65, marginBottom: '0.75rem' }}>
              {order.briefs.description}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginBottom: '0.15rem' }}>Kategori</p>
                <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'hsl(197 20% 20%)' }}>{order.briefs.category}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginBottom: '0.15rem' }}>Kelengkapan Brief</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 80, height: 4, background: 'hsl(197 30% 90%)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${order.briefs.completeness_score}%`, background: '#87CEEB', borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'hsl(197 45% 38%)' }}>
                    {order.briefs.completeness_score}%
                  </span>
                </div>
              </div>
            </div>
            {Object.keys(order.briefs.fields || {}).length > 0 && (
              <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {Object.entries(order.briefs.fields).map(([k, v]) => (
                  <p key={k} style={{ fontSize: '0.78rem', color: 'hsl(197 20% 45%)' }}>
                    <span style={{ fontWeight: 600 }}>{k}:</span> {String(v)}
                  </p>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── Payment info ─────────────────────────────────── */}
      <SectionHeader>Pembayaran</SectionHeader>
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total', value: `Rp${formatCurrency(order.total_amount)}` },
            { label: 'Down Payment (50%)', value: `Rp${formatCurrency(order.down_payment)}` },
            { label: 'DP Released', value: order.down_payment_released ? 'Ya ✓' : 'Belum' },
            { label: 'Sisa Revisi', value: `${order.max_revisions - order.revision_count} / ${order.max_revisions}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginBottom: '0.15rem' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Deliverables ─────────────────────────────────── */}
      {order.deliverables && order.deliverables.length > 0 && (
        <>
          <SectionHeader>File Deliverable</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {order.deliverables.map((del) => (
              <Card key={del.id} style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>
                    {del.is_final ? 'File Final' : del.type === 'revision' ? 'Revisi' : 'Draft'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
                    {del.is_watermarked ? 'Dengan watermark' : 'Tanpa watermark'}
                  </p>
                </div>
                <a
                  href={del.is_watermarked ? del.file_url : del.original_url || del.file_url}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '0.4rem 0.9rem', background: 'hsl(197 45% 38%)', color: '#fff',
                    borderRadius: 999, fontSize: '0.78rem', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {del.is_watermarked ? 'Pratinjau' : 'Unduh'}
                </a>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Feedback ─────────────────────────────────────── */}
      <SectionHeader>Feedback</SectionHeader>
      <Card style={{ marginBottom: '1rem' }}>
        {feedbackOpen ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tulis feedback di sini..."
              rows={3}
              style={textareaSx}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionBtn>Kirim</ActionBtn>
              <ActionBtn onClick={() => setFeedbackOpen(false)} variant="ghost">Tutup</ActionBtn>
            </div>
          </div>
        ) : (
          <div>
            <ActionBtn onClick={() => setFeedbackOpen(true)} variant="ghost">Buka Jendela Feedback</ActionBtn>
            {order.status === 'IN_PROGRESS' && (
              <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 60%)', marginTop: '0.5rem' }}>
                Kreator sedang fokus bekerja. Feedback akan dibaca saat jendela dibuka.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ── History timeline ──────────────────────────────── */}
      <SectionHeader>Riwayat</SectionHeader>
      <Card>
        {history.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'hsl(197 20% 60%)' }}>Belum ada riwayat.</p>
        ) : (
          <div>
            {history.map((entry, i) => (
              <TimelineEntry key={entry.id} entry={entry} isLast={i === history.length - 1} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
