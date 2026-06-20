import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  await resend.emails.send({
    from: 'Guild App <noreply@guildapp.id>',
    to,
    subject,
    html,
  })
}

export const EMAIL_TEMPLATES = {
  order_accepted: (data: { client_name: string; creator_name: string; payment_url: string }) => ({
    subject: 'Pesananmu Diterima!',
    html: `<h2>Hai ${data.client_name},</h2><p>Kreator <strong>${data.creator_name}</strong> telah menerima pesananmu.</p><p>Silakan lakukan pembayaran untuk memulai proses.</p><a href="${data.payment_url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">Bayar Sekarang</a>`
  }),
  final_review: (data: { client_name: string; tracker_url: string }) => ({
    subject: 'Karya Siap untuk Disetujui',
    html: `<h2>Hai ${data.client_name},</h2><p>Kreator telah mengirimkan hasil akhir.</p><p>Kamu punya <strong>5 hari kerja</strong> untuk menyetujui atau meminta revisi.</p><a href="${data.tracker_url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">Lihat Karya</a>`
  }),
  auto_release_warning: (data: { client_name: string; creator_name: string; tracker_url: string }) => ({
    subject: '1 Hari Lagi Dana Otomatis Dicairkan',
    html: `<p>Kamu belum menyetujui karya dari ${data.creator_name}.</p><p>Dana akan otomatis dicairkan dalam 24 jam.</p><a href="${data.tracker_url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">Approve Sekarang</a>`
  }),
}
