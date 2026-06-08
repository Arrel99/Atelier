import type { OrderStatus } from '@/types'

/**
 * Label Bahasa Indonesia untuk setiap status order.
 * Digunakan di dashboard, order tracker, dan komponen lain yang menampilkan status.
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  BRIEF_PENDING: 'Brief Baru',
  PENDING_APPROVAL: 'Perlu Respons',
  COUNTER_OFFER: 'Negosiasi',
  IN_PROGRESS: 'Sedang Dikerjakan',
  FINAL_REVIEW: 'Menunggu Approve',
  APPROVED: 'Selesai',
  DECLINED: 'Ditolak',
  DISPUTED: 'Sengketa',
  CANCELLED: 'Dibatalkan',
}

/**
 * Template field brief per kategori jasa.
 * Menentukan field tambahan yang ditampilkan di form brief berdasarkan kategori.
 */
export const BRIEF_TEMPLATES: Record<string, { label: string; type: string }[]> = {
  ilustrasi: [
    { label: 'Gaya Seni', type: 'text' },
    { label: 'Referensi (URL)', type: 'url' },
    { label: 'Ukuran Kanvas', type: 'text' },
    { label: 'Warna Dominan', type: 'text' },
  ],
  logo: [
    { label: 'Industri Klien', type: 'text' },
    { label: 'Nilai Brand', type: 'text' },
    { label: 'Mood Board (URL)', type: 'url' },
    { label: 'Format File Output', type: 'text' },
  ],
  video: [
    { label: 'Durasi (menit)', type: 'number' },
    { label: 'Tone', type: 'text' },
    { label: 'Platform Distribusi', type: 'text' },
    { label: 'Aset Tersedia', type: 'text' },
  ],
}
