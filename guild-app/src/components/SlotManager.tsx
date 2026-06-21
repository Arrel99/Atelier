'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import type { CreatorProfile, Slot, SlotTier } from '@/types'

const inputSx: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.85rem',
  border: '1px solid hsl(197 30% 88%)', borderRadius: 8,
  fontSize: '0.85rem', color: 'hsl(197 20% 12%)',
  background: '#fff', outline: 'none', fontFamily: 'var(--font-body)',
  transition: 'border-color 0.12s',
}

const labelSx: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 500, color: 'hsl(197 20% 45%)',
  display: 'block', marginBottom: '0.3rem',
}

const TIER_STYLE: Record<SlotTier, { bg: string; text: string; label: string }> = {
  regular:  { bg: 'hsl(197 72% 93%)', text: 'hsl(197 45% 38%)', label: 'Regular' },
  rush:     { bg: 'hsl(35 80% 91%)',  text: 'hsl(35 60% 40%)',  label: 'Rush' },
  waitlist: { bg: 'hsl(270 40% 93%)', text: 'hsl(270 50% 50%)', label: 'Waitlist' },
}

export default function SlotManager({
  profile, slots,
}: {
  profile: Pick<CreatorProfile, 'id' | 'max_slots'>
  slots: Slot[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [tier, setTier] = useState<SlotTier>('regular')
  const [price, setPrice] = useState('')
  const [month, setMonth] = useState('')
  const [label, setLabel] = useState('')
  const [maxSlotCount, setMaxSlotCount] = useState(3)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const activeSlots = slots.filter(s => s.is_available)
  const usedPercent  = Math.round((activeSlots.length / profile.max_slots) * 100)

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setCreating(true)
    const { error: err } = await supabase.from('slots').insert({
      creator_id: profile.id, tier,
      price: parseFloat(price), month,
      label: label || `${tier} - ${month}`,
      max_slots: maxSlotCount,
    })
    setCreating(false)
    if (err) { setError(err.message) }
    else { setPrice(''); setMonth(''); setLabel(''); router.refresh() }
  }

  const handleToggle = async (slotId: string, current: boolean) => {
    setToggling(slotId)
    await supabase.from('slots').update({ is_available: !current }).eq('id', slotId)
    setToggling(null)
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)' }}>
            Kelola Slot
          </h1>
        </div>
      </div>

      {/* ── Slot usage bar ───────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12,
        padding: '1.1rem 1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'hsl(197 20% 25%)' }}>
            Kapasitas Slot
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(197 45% 38%)', fontFamily: 'var(--font-headline)' }}>
              {activeSlots.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)' }}>/ {profile.max_slots} aktif</span>
          </div>
        </div>
        <div style={{ height: 6, background: 'hsl(197 30% 90%)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${usedPercent}%`, borderRadius: 999,
            background: usedPercent >= 90 ? 'hsl(35 70% 55%)' : '#87CEEB',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)', marginTop: '0.4rem' }}>
          {profile.max_slots - activeSlots.length} slot tersisa
        </p>
      </div>

      {/* ── Create slot form ──────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12,
        overflow: 'hidden', marginBottom: '1.5rem',
      }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Buat Slot Baru</p>
        </div>

        <form onSubmit={handleCreateSlot} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{
              padding: '0.65rem 0.9rem',
              background: 'hsl(0 65% 50% / 0.07)', border: '1px solid hsl(0 65% 50% / 0.2)',
              borderRadius: 8, fontSize: '0.82rem', color: 'hsl(0 65% 45%)',
            }}>{error}</div>
          )}

          {/* Tier picker */}
          <div>
            <label style={labelSx}>Tier</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['regular', 'rush', 'waitlist'] as SlotTier[]).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setTier(t)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500,
                    border: `1.5px solid ${tier === t ? '#87CEEB' : 'hsl(197 30% 88%)'}`,
                    background: tier === t ? 'hsl(197 72% 93%)' : '#fff',
                    color: tier === t ? 'hsl(197 45% 38%)' : 'hsl(197 20% 50%)',
                    cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'var(--font-body)',
                  }}
                >
                  {TIER_STYLE[t].label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="slot-price" style={labelSx}>Harga (Rp)</label>
              <input id="slot-price" type="number" value={price} onChange={e => setPrice(e.target.value)}
                required min={0} placeholder="350000"
                style={inputSx}
                onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
              />
            </div>
            <div>
              <label htmlFor="slot-month" style={labelSx}>Bulan</label>
              <input id="slot-month" type="month" value={month} onChange={e => setMonth(e.target.value)}
                required style={inputSx}
                onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
              />
            </div>
            <div>
              <label htmlFor="slot-label" style={labelSx}>Label (opsional)</label>
              <input id="slot-label" type="text" value={label} onChange={e => setLabel(e.target.value)}
                placeholder="cth: Regular Jan 2026"
                style={inputSx}
                onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
              />
            </div>
            <div>
              <label htmlFor="slot-max" style={labelSx}>Maks Slot</label>
              <input id="slot-max" type="number" value={maxSlotCount} onChange={e => setMaxSlotCount(parseInt(e.target.value, 10))}
                min={1} max={20}
                style={inputSx}
                onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                onBlur={e => (e.target.style.borderColor = 'hsl(197 30% 88%)')}
              />
            </div>
          </div>

          <button type="submit" disabled={creating} style={{
            padding: '0.7rem', background: creating ? 'hsl(197 30% 85%)' : 'hsl(197 45% 38%)',
            color: '#fff', border: 'none', borderRadius: 999,
            fontSize: '0.875rem', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', alignSelf: 'flex-start', paddingLeft: '1.5rem', paddingRight: '1.5rem',
          }}>
            {creating ? 'Membuat…' : '+ Buat Slot'}
          </button>
        </form>
      </div>

      {/* ── Slot list ─────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid hsl(197 30% 93%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 20%)' }}>Semua Slot</p>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 999,
            background: 'hsl(197 72% 93%)', color: 'hsl(197 45% 38%)',
          }}>{slots.length}</span>
        </div>

        {slots.length === 0 ? (
          <p style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'hsl(197 20% 55%)', textAlign: 'center' }}>
            Belum ada slot. Buat slot baru di atas.
          </p>
        ) : (
          <div>
            {slots.map((slot, i) => {
              const t = TIER_STYLE[slot.tier as SlotTier] ?? TIER_STYLE.regular
              return (
                <div key={slot.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem', gap: '1rem',
                  borderTop: i > 0 ? '1px solid hsl(197 30% 93%)' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                      background: t.bg, color: t.text, flexShrink: 0,
                    }}>
                      {t.label}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(197 20% 15%)' }}>
                        Rp{formatCurrency(slot.price)}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'hsl(197 20% 55%)' }}>
                        {slot.month}{slot.label ? ` · ${slot.label}` : ''}
                        {slot.max_slots ? ` · max ${slot.max_slots}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(slot.id, slot.is_available)}
                    disabled={toggling === slot.id}
                    style={{
                      padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                      cursor: toggling === slot.id ? 'wait' : 'pointer',
                      border: '1px solid',
                      background: slot.is_available ? 'hsl(152 40% 92%)' : 'hsl(0 0% 95%)',
                      color:      slot.is_available ? 'hsl(152 55% 35%)' : 'hsl(0 65% 50%)',
                      borderColor: slot.is_available ? 'hsl(152 40% 82%)' : 'hsl(0 60% 80%)',
                      transition: 'all 0.12s', fontFamily: 'var(--font-body)',
                      opacity: toggling === slot.id ? 0.6 : 1,
                    }}
                  >
                    {toggling === slot.id ? '…' : slot.is_available ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
