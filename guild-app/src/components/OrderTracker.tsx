'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { OrderFull, OrderHistory } from '@/types'

export default function OrderTracker({
  order,
  history,
  isClient,
  isCreator,
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

  // Polling every 30 seconds
  const pollOrder = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('status, current_stage_index')
      .eq('id', order.id)
      .single()

    if (data && (data.status !== order.status || data.current_stage_index !== order.current_stage_index)) {
      router.refresh()
    }
  }, [order.id, order.status, order.current_stage_index, supabase, router])

  useEffect(() => {
    const interval = setInterval(pollOrder, 30000)
    return () => clearInterval(interval)
  }, [pollOrder])

  const handleStatusChange = async (newStatus: string) => {
    setError('')

    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
    } else {
      router.refresh()
    }
  }

  const handleStageAdvance = async () => {
    if (order.current_stage_index < order.tracker_stages.length - 1) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          current_stage_index: order.current_stage_index + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        router.refresh()
      }
    }
  }

  const handleSubmitFinal = async () => {
    setError('')
    // In a real implementation, this would upload file to Supabase Storage
    // For now, simulate with a placeholder

    const { error: delError } = await supabase.from('deliverables').insert({
      order_id: order.id,
      file_url: 'https://placeholder.example/final-file',
      is_final: true,
      is_watermarked: true,
    })

    if (delError) {
      setError(delError.message)
      return
    }

    handleStatusChange('FINAL_REVIEW')
  }

  const currentStage = order.tracker_stages[order.current_stage_index] ?? '—'
  const stageProgress = ((order.current_stage_index + 1) / order.tracker_stages.length) * 100

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        {order.briefs?.project_title ?? 'Pesanan'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Kreator: {order.creator_profiles?.display_name} &middot;
        Status: <span className="font-medium">{STATUS_LABELS[order.status] ?? order.status}</span>
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </p>
      )}

      {/* Progress Tracker */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Progress</h2>
        <div className="flex items-center gap-2 mb-2">
          {order.tracker_stages.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div
                className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                  i <= order.current_stage_index
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                }`}
              >
                {stage}
              </div>
              {i < order.tracker_stages.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 ${
                    i < order.current_stage_index
                      ? 'bg-black'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Tahap saat ini: <span className="font-medium">{currentStage}</span>
          {isCreator && order.status === 'IN_PROGRESS' && (
            <button
              onClick={handleStageAdvance}
              disabled={order.current_stage_index >= order.tracker_stages.length - 1}
              className="ml-3 px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              Maju Tahap
            </button>
          )}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-black h-2 rounded-full transition-all"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </div>

      {/* Brief Details */}
      {order.briefs && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Detail Brief</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {order.briefs.description}
          </p>
          <p className="text-sm text-gray-500">
            Kategori: {order.briefs.category} &middot;
            Skor Kelengkapan: {order.briefs.completeness_score}%
          </p>
          {Object.keys(order.briefs.fields).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(order.briefs.fields).map(([key, value]) => (
                <p key={key} className="text-xs text-gray-500">
                  <span className="font-medium">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Aksi</h2>

        {order.status === 'PENDING_APPROVAL' && isCreator && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
            >
              Terima & Mulai
            </button>
            <button
              onClick={() => handleStatusChange('DECLINED')}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Tolak
            </button>
            <button
              onClick={() => handleStatusChange('COUNTER_OFFER')}
              className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg text-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              Counter-Offer
            </button>
          </div>
        )}

        {order.status === 'COUNTER_OFFER' && isClient && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange('PENDING_APPROVAL')}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
            >
              Setuju
            </button>
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              Batalkan
            </button>
          </div>
        )}

        {order.status === 'IN_PROGRESS' && isCreator && (
          <button
            onClick={handleSubmitFinal}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            Kirim File Final
          </button>
        )}

        {order.status === 'FINAL_REVIEW' && isClient && (
          <button
            onClick={() => handleStatusChange('APPROVED')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Approve & Selesaikan
          </button>
        )}

        {['IN_PROGRESS', 'FINAL_REVIEW'].includes(order.status) && (
          <button
            onClick={() => handleStatusChange('DISPUTED')}
            className="ml-3 px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Ajukan Sengketa
          </button>
        )}

        {order.status === 'APPROVED' && (
          <p className="text-green-600 font-medium">Pesanan selesai ✓</p>
        )}

        {order.status === 'DECLINED' && (
          <p className="text-red-500">Pesanan ditolak oleh kreator.</p>
        )}

        {order.status === 'CANCELLED' && (
          <p className="text-gray-500">Pesanan dibatalkan.</p>
        )}
      </div>

      {/* Financial info */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Informasi Pembayaran</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium">Rp{formatCurrency(order.total_amount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Down Payment (50%)</p>
            <p className="font-medium">Rp{formatCurrency(order.down_payment)}</p>
          </div>
          <div>
            <p className="text-gray-500">DP Released</p>
            <p className="font-medium">{order.down_payment_released ? 'Ya' : 'Belum'}</p>
          </div>
          <div>
            <p className="text-gray-500">Sisa Revisi</p>
            <p className="font-medium">
              {order.max_revisions - order.revision_count} / {order.max_revisions}
            </p>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      {order.deliverables && order.deliverables.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">File</h2>
          <div className="space-y-2">
            {order.deliverables.map((del) => (
              <div key={del.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {del.is_final ? 'File Final' : 'Draft'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {del.is_watermarked ? 'Dengan watermark' : 'Tanpa watermark'}
                  </p>
                </div>
                <a
                  href={del.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                >
                  Unduh
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Window */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Feedback</h2>
        {feedbackOpen ? (
          <div className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis feedback di sini..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 text-sm"
            />
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800">
                Kirim
              </button>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            Buka Jendela Feedback
          </button>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {order.status === 'IN_PROGRESS'
            ? 'Kreator sedang fokus bekerja. Feedback akan dibaca saat jendela dibuka.'
            : ''}
        </p>
      </div>

      {/* Audit Trail */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Riwayat</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm p-2">
                <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-500">
                    {STATUS_LABELS[entry.to_status] ?? entry.to_status}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
