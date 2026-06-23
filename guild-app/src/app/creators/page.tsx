import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CreatorCard from './CreatorCard'

interface CreatorBadge { id: string; badge_type: string }
interface CreatorUser  { full_name: string; avatar_url: string | null }
interface CreatorItem {
  id: string
  display_name: string
  bio: string | null
  category: string
  is_verified: boolean
  on_time_rate: number
  repeat_client_rate: number
  brief_accuracy_score: number
  max_slots: number
  users: CreatorUser | null
  reputation_badges?: CreatorBadge[]
}

export const metadata = {
  title: 'Kreator — Atelier',
  description: 'Temukan kreator ilustrasi, desain, dan aset visual terbaik di Indonesia.',
}

const CATEGORIES = ['Semua', 'Illustration', 'Design', 'Character', 'Logo', 'Animation', 'Vtuber']

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase
    .from('creator_profiles')
    .select(`*, users(full_name, avatar_url), reputation_badges(badge_type)`)
    .order('on_time_rate', { ascending: false })

  const list = (creators ?? []) as CreatorItem[]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* ── Page header ─────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontWeight: 700, letterSpacing: '-0.02em',
          color: 'hsl(197 20% 12%)', marginBottom: '0.4rem',
        }}>
          Ilustrator &amp; Desainer
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 50%)' }}>
          {list.length} kreator siap menerima pesanan
        </p>
      </div>

      {/* ── Category filter pills ───────────────────────── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map((cat, i) => (
          <span key={cat} style={{
            padding: '0.35rem 0.9rem', borderRadius: 999,
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
            background: i === 0 ? '#87CEEB' : 'hsl(0 0% 96%)',
            color: i === 0 ? 'hsl(197 25% 12%)' : 'hsl(197 20% 45%)',
            border: `1px solid ${i === 0 ? '#87CEEB' : 'hsl(197 30% 88%)'}`,
            transition: 'all 0.12s',
          }}>
            {cat}
          </span>
        ))}
      </div>

      {/* ── Grid ────────────────────────────────────────── */}
      {list.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'hsl(197 20% 55%)', fontSize: '0.875rem',
        }}>
          Belum ada kreator.{' '}
          <Link href="/auth/register" style={{ color: 'hsl(197 45% 38%)', textDecoration: 'none' }}>
            Daftar sebagai kreator →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {list.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  )
}

