'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import type { CreatorProfile, Slot, SlotTier } from '@/types'

export default function SlotManager({
  profile,
  slots,
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

  const activeSlots = slots.filter((s) => s.is_available)

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error: insertError } = await supabase.from('slots').insert({
      creator_id: profile.id,
      tier,
      price: parseFloat(price),
      month,
      label: label || `${tier} - ${month}`,
      max_slots: maxSlotCount,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setPrice('')
      setMonth('')
      router.refresh()
    }
  }

  const handleToggleSlot = async (slotId: string, currentAvailable: boolean) => {
    await supabase.from('slots').update({ is_available: !currentAvailable }).eq('id', slotId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">
            Slot terpakai: {slots.length - activeSlots.length} / {profile.max_slots}
          </p>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Kembali ke Dashboard</Link>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all"
            style={{ width: `${(activeSlots.length / profile.max_slots) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleCreateSlot} className="space-y-3 p-4 border rounded-lg">
        <h2 className="font-semibold">Buat Slot Baru</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value as SlotTier)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 text-sm">
              <option value="regular">Regular</option>
              <option value="rush">Rush (1.5x–2x)</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Regular - Jan 2026"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Max Slot:</label>
          <input type="number" value={maxSlotCount} onChange={(e) => setMaxSlotCount(parseInt(e.target.value))} min={1} max={20}
            className="w-20 px-3 py-2 border rounded-lg dark:bg-gray-900 text-sm" />
          <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
            Buat Slot
          </button>
        </div>
      </form>

      <div>
        <h2 className="font-semibold mb-3">Slot Tersedia</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada slot. Buat slot baru di atas.</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium capitalize min-w-[70px]">{slot.tier}</span>
                  <span className="text-sm">Rp{formatCurrency(slot.price)}</span>
                  <span className="text-sm text-gray-500">{slot.month}</span>
                  {slot.label && <span className="text-xs text-gray-400">({slot.label})</span>}
                </div>
                <button
                  onClick={() => handleToggleSlot(slot.id, slot.is_available)}
                  className={`px-3 py-1 text-xs rounded ${
                    slot.is_available
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {slot.is_available ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
