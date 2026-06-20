'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ClientOnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('users')
      .update({ tos_accepted_at: new Date().toISOString(), onboarding_completed: true })
      .eq('id', user.id)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Sebelum Mulai</h1>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 max-h-64 overflow-y-scroll text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-4">Dengan menggunakan platform ini, kamu setuju bahwa:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Kreator memiliki hak untuk menolak atau menerima pesanan berdasarkan brief yang diajukan.</li>
            <li>Pembayaran dilakukan melalui sistem escrow untuk melindungi kedua belah pihak.</li>
            <li>Revisi dibatasi sesuai kesepakatan awal. Revisi tambahan dapat dikenakan biaya.</li>
            <li>Dana akan otomatis dicairkan ke kreator jika tidak ada respons dalam 5 hari kerja setelah final review.</li>
            <li>Sengketa akan diselesaikan oleh admin platform dengan keputusan yang mengikat.</li>
            <li>Konten yang melanggar hukum atau hak cipta tidak diperbolehkan.</li>
          </ul>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Saya telah membaca dan menyetujui Terms of Service</span>
        </label>
        <button
          disabled={!agreed || loading}
          onClick={handleAccept}
          className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50 hover:bg-gray-800 transition"
        >
          {loading ? 'Memproses...' : 'Lanjutkan ke Platform'}
        </button>
      </div>
    </div>
  )
}
