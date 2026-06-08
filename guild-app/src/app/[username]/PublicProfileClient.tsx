'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BRIEF_TEMPLATES } from '@/lib/constants'
import type { CreatorProfile, Slot } from '@/types'

export default function PublicProfileClient({
  profile,
  slots,
  remainingSlots,
}: {
  profile: CreatorProfile
  slots: Slot[]
  remainingSlots: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const templateFields = BRIEF_TEMPLATES[category] ?? []
  const totalFields = templateFields.length + (projectTitle ? 1 : 0) + (description ? 1 : 0)
  const filledFields =
    (projectTitle ? 1 : 0) +
    (description ? 1 : 0) +
    templateFields.filter((f) => customFields[f.label]?.trim()).length
  const completenessScore =
    totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

  const handleFieldChange = (label: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [label]: value }))
  }

  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (completenessScore < 70) {
      setError(`Skor kelengkapan ${completenessScore}%. Minimal 70% untuk bisa mengirim brief.`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        creator_id: profile.id,
        client_id: user.id,
        status: 'BRIEF_PENDING',
        total_amount: slots[0]?.price ?? 0,
        down_payment: Math.round((slots[0]?.price ?? 0) * 0.5),
      })
      .select()
      .single()

    if (orderError) {
      setError(orderError.message)
      return
    }

    const { error: briefError } = await supabase.from('briefs').insert({
      order_id: order.id,
      project_title: projectTitle,
      description,
      category,
      completeness_score: completenessScore,
      fields: customFields,
    })

    if (briefError) {
      setError(briefError.message)
      return
    }

    setSuccess('Brief berhasil dikirim! Kreator akan merespons dalam waktu 1x24 jam.')
    setShowForm(false)
    setProjectTitle('')
    setDescription('')
    setCategory('')
    setCustomFields({})
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        {profile.avatar_url && (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={80}
            height={80}
            className="rounded-full mx-auto mb-3 object-cover"
          />
        )}
        <h1 className="text-2xl font-bold">
          {profile.display_name}
          {profile.is_verified && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
              Verified
            </span>
          )}
        </h1>
        <p className="text-gray-500">{profile.bio}</p>
        <p className="text-sm text-gray-400">Kategori: {profile.category}</p>
      </div>

      {/* Reputation badges */}
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

      {/* Slots */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Slot Tersedia</h2>
        <p className="text-sm text-gray-500 mb-3">
          Sisa slot bulan ini: {remainingSlots} / {profile.max_slots}
        </p>
        {slots.length === 0 || remainingSlots <= 0 ? (
          <p className="text-sm text-gray-400 p-4 border rounded-lg text-center">
            Slot bulan ini penuh. Silakan cek kembali bulan depan.
          </p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium capitalize">{slot.tier}</span>
                  <span className="text-xs text-gray-500 ml-2">{slot.month}</span>
                </div>
                <span className="font-semibold">
                  Rp{slot.price.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brief form */}
      {remainingSlots > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Ajukan Brief Pesanan
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitBrief} className="space-y-4 p-4 border rounded-lg">
          <h2 className="font-semibold">Form Brief</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Judul Proyek</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori Jasa</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Pilih kategori...</option>
              <option value="ilustrasi">Ilustrasi</option>
              <option value="logo">Desain Logo</option>
              <option value="video">Edit Video</option>
            </select>
          </div>

          {templateFields.map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                value={customFields[field.label] ?? ''}
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          ))}

          {totalFields > 0 && (
            <div>
              <p className="text-sm text-gray-500">
                Skor Kelengkapan:{' '}
                <span
                  className={`font-semibold ${
                    completenessScore >= 70 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {completenessScore}%
                </span>
                {completenessScore < 70 && ' (minimal 70%)'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full ${
                    completenessScore >= 70 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(completenessScore, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
            >
              Kirim Brief
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
