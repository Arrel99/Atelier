'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAuthPage = pathname.startsWith('/auth/')
  const isHomePage = pathname === '/'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        supabase
          .from('creator_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single()
          .then(({ data: cp }) => { setIsCreator(!!cp) })
      }
    })
  }, [supabase])

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (isAuthPage || isHomePage) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-200',
          scrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-[var(--color-border)]'
            : 'bg-[var(--color-bg)] border-b border-[var(--color-border)]',
        ].join(' ')}
        style={scrolled ? { boxShadow: 'var(--shadow-sm)' } : undefined}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-headline text-xl font-bold italic text-[var(--text-primary)] hover:text-[var(--color-sky-dark)] transition-colors"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Atelier
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
              <NavLink href="/dashboard">Dashboard</NavLink>
              {isCreator && <NavLink href="/dashboard/slots">Slot</NavLink>}
              <NavLink href="/creators">Kreator</NavLink>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {userId && <NotificationBell userId={userId} />}
            {!userId && (
              <Link
                href="/auth/login"
                className="text-sm px-4 py-2 rounded-[var(--radius-pill)] bg-[var(--color-sky-dark)] text-white hover:bg-[var(--color-sky-deep)] transition-colors"
              >
                Masuk
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 6h14M3 10h14M3 14h14" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex flex-col gap-1"
            aria-label="Navigasi mobile"
          >
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            {isCreator && <MobileNavLink href="/dashboard/slots">Kelola Slot</MobileNavLink>}
            <MobileNavLink href="/creators">Jelajahi Kreator</MobileNavLink>
          </nav>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────── */}
      <main className="flex-1 pt-14">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={[
        'px-3 py-1.5 rounded-lg text-sm transition-colors',
        active
          ? 'text-[var(--color-sky-dark)] bg-[var(--color-sky-pale)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-muted)]',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-muted)] transition-colors"
    >
      {children}
    </Link>
  )
}
