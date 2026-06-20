'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BRIEF_TEMPLATES } from '@/lib/constants'
import { formatCurrency, calcCompletenessScore } from '@/lib/format'
import type { CreatorProfile, Slot } from '@/types'

interface ProfileWithBadges extends CreatorProfile {
  reputation_badges?: { badge_type: string; id: string }[]
}

export default function PublicProfile({
  profile,
  slots,
  remainingSlots,
}: {
  profile: ProfileWithBadges
  slots: Slot[]
  remainingSlots: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)

  const template = BRIEF_TEMPLATES[category] ?? []
  const score = calcCompletenessScore(answers, template)

  const handleFieldChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleJoinWaitlist = async (slotId: string) => {
    setWaitlistLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_config_id: slotId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
    } else {
      const data = await res.json()
      setSuccess(`Kamu masuk antrean di posisi ${data.position}. Kami akan memberitahu jika slot tersedia.`)
    }
    setWaitlistLoading(false)
  }

  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (score < 70) {
      setError(`Skor kelengkapan ${score}%. Minimal 70% untuk bisa mengirim brief.`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const slot = slots[0]
    if (!slot) { setError('Tidak ada slot tersedia.'); return }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        creator_id: profile.id,
        client_id: user.id,
        slot_id: slot.id,
        slot_config_id: slot.id,
        status: 'BRIEF_PENDING',
        total_amount: slot.price,
        down_payment: Math.round(slot.price * 0.5),
      })
      .select()
      .single()

    if (orderError) { setError(orderError.message); return }

    const { error: briefError } = await supabase.from('briefs').insert({
      order_id: order.id,
      project_title: projectTitle,
      description,
      category,
      completeness_score: score,
      fields: answers,
      answers,
    })

    if (briefError) { setError(briefError.message); return }

    setSuccess('Brief berhasil dikirim! Kreator akan merespons dalam waktu 1x24 jam.')
    setShowForm(false)
    setProjectTitle('')
    setDescription('')
    setCategory('')
    setAnswers({})
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        {profile.avatar_url && (
          <Image src={profile.avatar_url} alt={profile.display_name} width={80} height={80}
            className="rounded-full mx-auto mb-3 object-cover" />
        )}
        <h1 className="text-2xl font-bold">
          {profile.display_name}
          {profile.is_verified && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>
          )}
        </h1>
        <p className="text-gray-500">{profile.bio}</p>
        <p className="text-sm text-gray-400">Kategori: {profile.category}</p>
      </div>

      {profile.reputation_badges && profile.reputation_badges.length > 0 && (
        <div className="flex gap-2 justify-center mb-4">
          {profile.reputation_badges.map((badge) => (
            <span key={badge.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              {badge.badge_type}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 border rounded-lg text-center">
          <p className="text-lg font-bold">{profile.on_time_rate}%</p>
          <p className="text-xs text-gray-500">Tepat Waktu</p>
        </div>
        <div className="p-3 border rounded-lg text-center">
          <p className="text-lg font-bold">{profile.repeat_client_rate}%</p>
          <p className="text-xs text-gray-500">Klien Setia</p>
        </div>
        <div className="p-3 border rounded-lg text-center">
          <p className="text-lg font-bold">{profile.brief_accuracy_score}%</p>
          <p className="text-xs text-gray-500">Akurasi Brief</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Slot Tersedia</h2>
        <p className="text-sm text-gray-500 mb-3">
          Sisa slot bulan ini: {remainingSlots} / {profile.max_slots}
        </p>
        {slots.length === 0 || remainingSlots <= 0 ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 p-4 border rounded-lg mb-3">
              Slot bulan ini penuh. Silakan cek kembali bulan depan atau masuk waitlist.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <span className="text-sm font-medium capitalize">{slot.tier}</span>
                  <span className="text-xs text-gray-500 ml-2">{slot.month}</span>
                  {slot.label && <span className="text-xs text-gray-400 ml-1">({slot.label})</span>}
                </div>
                <span className="font-semibold">Rp{formatCurrency(slot.price)}</span>
              </div>
            ))}
          </div>
        )}
        {remainingSlots <= 0 && slots.length > 0 && (
          <button
            onClick={() => handleJoinWaitlist(slots[0].id)}
            disabled={waitlistLoading}
            className="mt-3 w-full py-2 border border-dashed rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {waitlistLoading ? 'Memproses...' : 'Masuk Waitlist'}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4 p-3 bg-green-50 rounded">{success}</p>}

      {remainingSlots > 0 && !showForm && (
        <button onClick={() => setShowForm(true)} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Ajukan Brief Pesanan
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitBrief} className="space-y-4 p-4 border rounded-lg">
          <h2 className="font-semibold">Form Brief</h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Kelengkapan Brief</span>
              <span className={score >= 70 ? 'text-green-600' : 'text-orange-500'}>{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${score >= 70 ? 'bg-green-500' : 'bg-orange-400'}`}
                style={{ width: `${score}%` }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Judul Proyek</label>
            <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori Jasa</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900">
              <option value="">Pilih kategori...</option>
              <option value="illustration">Ilustrasi</option>
              <option value="logo">Desain Logo</option>
              <option value="video">Edit Video</option>
            </select>
          </div>

          {template.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select value={answers[field.id] ?? ''} onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900">
                  <option value="">Pilih...</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={answers[field.id] ?? ''} onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  rows={2} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900" />
              ) : (
                <input type={field.type} value={answers[field.id] ?? ''} onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900" />
              )}
              {field.hint && <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>}
            </div>
          ))}

          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
              Kirim Brief
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
