'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginFormContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  if (searchParams.get('registered') === 'true' && !success) {
    setSuccess('Akun berhasil dibuat. Silakan cek email untuk konfirmasi, lalu masuk.')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email harus diisi'); return }
    if (!password) { setError('Password harus diisi'); return }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    // fetch role and redirect
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push('/dashboard')
      router.refresh()
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    setLoading(false)
    router.push(profile?.role === 'creator' ? '/studio' : '/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.75rem',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            Atelier
          </Link>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            Masuk ke akunmu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'hsl(0 65% 50% / 0.08)',
                border: '1px solid hsl(0 65% 50% / 0.2)',
                borderRadius: 'var(--radius-input)',
                color: 'var(--color-error)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="email"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kamu@email.com"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-input)',
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                background: 'var(--color-surface)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="password"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-input)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                  background: 'var(--color-surface)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  paddingRight: '3rem',
                }}
                onFocus={e => (e.target.style.borderColor = '#87CEEB')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-tertiary)',
                }}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: loading ? 'var(--color-sky-pale)' : 'var(--color-sky-dark)',
              color: loading ? 'var(--color-sky-dark)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}
        >
          Belum punya akun?{' '}
          <Link
            href="/auth/register"
            style={{ color: 'var(--color-sky-dark)', textDecoration: 'none', fontWeight: 500 }}
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Memuat...</p>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}

