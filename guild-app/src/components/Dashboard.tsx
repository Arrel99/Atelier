'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Brief, CreatorProfile, OrderWithBrief, OrderWithCreator } from '@/types'

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

  const creatorPendingOrders = orders.filter(
    (o) => o.status === 'PENDING_APPROVAL' || o.status === 'BRIEF_PENDING' || o.status === 'COUNTER_OFFER'
  )
  const creatorActiveOrders = orders.filter(
    (o) => o.status === 'IN_PROGRESS' || o.status === 'PAYMENT_PENDING'
  )
  const creatorReviewOrders = orders.filter(
    (o) => o.status === 'FINAL_REVIEW' || o.status === 'REVISION_REQUESTED'
  )

  if (!profile) {
    return (
      <div>
        <p className="text-gray-500 mb-4">Akun klien — kamu tidak memiliki profil kreator.</p>
        <h2 className="text-lg font-semibold mb-3">Pesanan Sebagai Klien</h2>
        {renderOrderTable(clientOrders)}
        <button onClick={handleLogout} className="mt-6 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900">
          Keluar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="p-4 border rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              {profile.display_name}
              {profile.is_verified && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>
              )}
            </h2>
            <p className="text-sm text-gray-500">{profile.bio}</p>
            <p className="text-sm text-gray-500">Kategori: {profile.category}</p>
            <p className="text-sm text-gray-500">Slot maksimal: {profile.max_slots}</p>
            {!profile.probation_completed && (
              <p className="text-xs text-orange-500 mt-1">Status: Masa Probation ({profile.probation_orders_done || 0}/3 order)</p>
            )}
          </div>
          <Link href="/dashboard/slots" className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
            Kelola Slot
          </Link>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <Link href="/dashboard/settings/stages" className="text-blue-600 hover:underline">Atur Tahap Tracker</Link>
          <Link href="/onboarding/probation" className="text-blue-600 hover:underline">Status Probation</Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Perlu Direspons</h2>
        {renderOrderTable(creatorPendingOrders)}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Sedang Dikerjakan</h2>
        {renderOrderTable(creatorActiveOrders)}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Menunggu Approve / Revisi</h2>
        {renderOrderTable(creatorReviewOrders)}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Riwayat Pesanan</h2>
        {renderOrderTable(orders.filter((o) =>
          ['APPROVED', 'COMPLETED', 'DECLINED', 'CANCELLED', 'DISPUTE'].includes(o.status)
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Pesanan Sebagai Klien</h2>
        {renderOrderTable(clientOrders)}
      </div>

      <button onClick={handleLogout} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900">
        Keluar
      </button>
    </div>
  )

  function renderOrderTable(orderList: (OrderWithBrief | OrderWithCreator)[]) {
    if (orderList.length === 0) {
      return <p className="text-sm text-gray-400">Tidak ada pesanan.</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Proyek</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Tahap</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Tanggal</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="py-3 pr-4 font-medium">
                  {'briefs' in o ? (o.briefs as Brief)?.project_title : ''}
                  {'creator_profiles' in o ? (o.creator_profiles as { display_name: string })?.display_name : ''}
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {o.tracker_stages?.[o.current_stage_index] ?? '-'}
                </td>
                <td className="py-3 pr-4">Rp{formatCurrency(o.total_amount)}</td>
                <td className="py-3 pr-4 text-gray-500">{formatDate(o.created_at)}</td>
                <td className="py-3">
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}
