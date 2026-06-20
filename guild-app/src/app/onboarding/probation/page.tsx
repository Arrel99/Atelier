'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProbationPage() {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState({ probation_completed: false, total_done: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: cp } = await supabase
        .from('creator_profiles')
        .select('probation_completed, probation_orders_done, id')
        .eq('user_id', user.id)
        .single()

      if (cp) {
        setStatus({
          probation_completed: cp.probation_completed,
          total_done: cp.probation_orders_done || 0,
        })
      }
    }
    load()
  }, [supabase, router])

  const remaining = 3 - status.total_done
  const progress = (status.total_done / 3) * 100

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Masa Probation</h1>

        {status.probation_completed ? (
          <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-green-600 font-semibold text-lg">✓ Probation Selesai!</p>
            <p className="text-sm text-gray-500 mt-2">Akunmu telah terverifikasi. Semua fitur sudah bisa diakses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Selesaikan <strong>{remaining} order</strong> lagi untuk menyelesaikan masa probation dan membuka fitur lengkap.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-black h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Progress: {status.total_done} / 3 order ({Math.round(progress)}%)
            </p>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 text-left text-sm">
              <h3 className="font-medium mb-2">Yang akan kamu dapatkan setelah probation:</h3>
              <ul className="space-y-1 text-gray-500">
                <li>✓ Badge Verified di profil publik</li>
                <li>✓ Akses ke dashboard slot penuh</li>
                <li>✓ Muncul di direktori kreator</li>
                <li>✓ Bisa membuat hingga 10 slot</li>
              </ul>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
