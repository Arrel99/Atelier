'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StagesSettingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [stages, setStages] = useState(['Antrean', 'Sketsa', 'Revisi', 'Final'])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: cp } = await supabase
        .from('creator_profiles')
        .select('tracker_stages')
        .eq('user_id', user.id)
        .single()

      if (cp?.tracker_stages) {
        setStages(cp.tracker_stages as string[])
      }
    }
    load()
  }, [supabase])

  function addStage() {
    setStages([...stages, ''])
  }

  function removeStage(i: number) {
    setStages(stages.filter((_, idx) => idx !== i))
  }

  function updateStage(i: number, val: string) {
    const s = [...stages]
    s[i] = val
    setStages(s)
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/creator/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracker_stages: stages.filter(s => s.trim()) }),
    })
    if (res.ok) router.refresh()
    setSaving(false)
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Kustomisasi Tahap Tracker</h1>
      <p className="text-sm text-gray-500 mb-4">Sesuaikan tahap pengerjaan yang muncul di tracker pesanan.</p>

      {stages.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={s}
            onChange={e => updateStage(i, e.target.value)}
            placeholder={`Tahap ${i + 1}`}
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-900 text-sm"
          />
          <button onClick={() => removeStage(i)} className="px-3 py-2 text-red-500 border rounded text-sm hover:bg-red-50">
            Hapus
          </button>
        </div>
      ))}

      <div className="flex gap-3 mt-4">
        <button onClick={addStage} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">
          + Tambah Tahap
        </button>
        <button onClick={save} disabled={saving} className="px-6 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
