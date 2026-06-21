'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
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
            <input
              id="password"
              type="password"
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
              }}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
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
