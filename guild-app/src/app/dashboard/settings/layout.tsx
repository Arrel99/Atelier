'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const navLinkSx = (active: boolean): React.CSSProperties => ({
  display: 'block',
  padding: '0.6rem 1rem',
  borderRadius: 8,
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 400,
  color: active ? 'hsl(197 45% 38%)' : 'hsl(197 20% 45%)',
  background: active ? 'hsl(197 72% 93%)' : 'transparent',
  textDecoration: 'none',
  transition: 'all 0.12s',
})

const navSectionSx: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'hsl(197 20% 60%)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '0 1rem',
  marginBottom: '0.5rem',
  marginTop: '1.5rem',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const pathname = usePathname()
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('creator_profiles').select('display_name').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setDisplayName(data.display_name)
      })
    })
  }, [supabase])

  const links = [
    { href: '/dashboard/settings/stages', label: 'Tahap Tracker' },
    { href: '/dashboard/settings/forms', label: 'Formulir Kustom' },
    { href: '/dashboard/settings/services', label: 'Layanan' },
    { href: '/dashboard/settings/policies', label: 'Kebijakan' },
    { href: '/dashboard/settings/translate', label: 'Penerjemah' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
        ← Dashboard
      </Link>
      <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(197 20% 12%)', marginBottom: '1.5rem' }}>
        Pengaturan
      </h1>
      {displayName && (
        <p style={{ fontSize: '0.8rem', color: 'hsl(197 20% 55%)', marginBottom: '1rem', marginTop: '-1rem' }}>
          {displayName}
        </p>
      )}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <nav style={{
          width: 200, flexShrink: 0,
          background: '#fff', border: '1px solid hsl(197 30% 88%)', borderRadius: 12,
          padding: '1rem 0',
        }}>
          <p style={navSectionSx}>Atur</p>
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link key={l.href} href={l.href} style={navLinkSx(active)}>
                {l.label}
              </Link>
            )
          })}
        </nav>

        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
