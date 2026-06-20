import type { OrderStatus } from '@/types'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  BRIEF_PENDING: 'Brief Baru',
  PENDING_APPROVAL: 'Perlu Respons',
  COUNTER_OFFER: 'Negosiasi',
  PAYMENT_PENDING: 'Menunggu Pembayaran',
  IN_PROGRESS: 'Sedang Dikerjakan',
  REVISION_REQUESTED: 'Revisi Diminta',
  FINAL_REVIEW: 'Menunggu Approve',
  APPROVED: 'Disetujui',
  COMPLETED: 'Selesai',
  DECLINED: 'Ditolak',
  DISPUTE: 'Sengketa',
  CANCELLED: 'Dibatalkan',
}

export const FSM: Record<OrderStatus, OrderStatus[]> = {
  BRIEF_PENDING: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['PAYMENT_PENDING', 'DECLINED', 'COUNTER_OFFER', 'CANCELLED'],
  COUNTER_OFFER: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['FINAL_REVIEW'],
  REVISION_REQUESTED: ['IN_PROGRESS'],
  FINAL_REVIEW: ['REVISION_REQUESTED', 'APPROVED', 'DISPUTE'],
  APPROVED: ['COMPLETED'],
  COMPLETED: [],
  DECLINED: [],
  DISPUTE: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
}

export const BRIEF_TEMPLATES: Record<string, { id: string; label: string; type: string; weight: number; options?: string[]; hint?: string }[]> = {
  illustration: [
    { id: 'style', label: 'Gaya Seni', type: 'select', weight: 20, options: ['Anime', 'Chibi', 'Realis', 'Semi-realis', 'Kartun'], hint: 'Pilih gaya yang paling mendekati ekspektasimu' },
    { id: 'character_desc', label: 'Deskripsi Karakter', type: 'textarea', weight: 25, hint: 'Jelaskan tampilan karakter: rambut, pakaian, ekspresi, dll.' },
    { id: 'reference', label: 'Referensi Gambar', type: 'url', weight: 20, hint: 'Link Pinterest, Google Drive, atau referensi lain' },
    { id: 'canvas_size', label: 'Ukuran Kanvas', type: 'select', weight: 10, options: ['A4 (2480x3508)', 'Square (3000x3000)', 'Custom'] },
    { id: 'dominant_color', label: 'Warna Dominan', type: 'text', weight: 10, hint: 'Contoh: biru tua, pastel, monokrom' },
    { id: 'deadline_note', label: 'Catatan Deadline', type: 'textarea', weight: 15, hint: 'Ada keperluan khusus soal waktu?' },
  ],
  logo: [
    { id: 'industry', label: 'Industri/Bidang Usaha', type: 'text', weight: 20 },
    { id: 'brand_values', label: 'Nilai Brand', type: 'textarea', weight: 25, hint: 'Kata-kata yang merepresentasikan brand kamu (min. 3)' },
    { id: 'moodboard', label: 'Moodboard/Referensi', type: 'url', weight: 20 },
    { id: 'color_pref', label: 'Preferensi Warna', type: 'text', weight: 15 },
    { id: 'output_format', label: 'Format Output', type: 'select', weight: 10, options: ['AI + PNG', 'SVG + PNG', 'PDF + PNG'] },
    { id: 'competitors', label: 'Kompetitor', type: 'textarea', weight: 10 },
  ],
  video: [
    { id: 'duration', label: 'Durasi Video', type: 'text', weight: 15 },
    { id: 'platform', label: 'Platform Distribusi', type: 'select', weight: 20, options: ['YouTube', 'TikTok', 'Instagram Reels', 'LinkedIn'] },
    { id: 'tone', label: 'Tone/Suasana', type: 'select', weight: 20, options: ['Profesional', 'Fun', 'Cinematic', 'Documentary', 'Tutorial'] },
    { id: 'assets', label: 'Aset yang Tersedia', type: 'textarea', weight: 25, hint: 'Footage, foto, musik, voice over, dll.' },
    { id: 'references', label: 'Video Referensi', type: 'url', weight: 20 },
  ],
}
