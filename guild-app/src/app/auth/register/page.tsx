'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const passwordWrapper: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

const passwordInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '0.4rem',
  display: 'block',
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'client' | 'creator'>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Nama lengkap harus diisi'); return }
    if (!email.trim()) { setError('Email harus diisi'); return }
    if (!password) { setError('Password harus diisi'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/auth/login?registered=true')
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
      <div style={{ width: '100%', maxWidth: 440 }}>
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
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Buat akun gratis
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

          {/* Role picker — 2 big cards */}
          <div>
            <label style={labelStyle}>Daftar sebagai</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {([
                { value: 'client', label: 'Klien', desc: 'Saya ingin memesan jasa kreatif' },
                { value: 'creator', label: 'Kreator', desc: 'Saya ingin menawarkan jasa' },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: '1rem',
                    border: `1.5px solid ${role === value ? '#87CEEB' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-card)',
                    background: role === value ? 'var(--color-sky-pale)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: role === value ? 'var(--color-sky-dark)' : 'var(--text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                    {desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" style={labelStyle}>Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nama kamu"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          <div>
            <label htmlFor="reg-email" style={labelStyle}>Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kamu@email.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#87CEEB')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          <div>
            <label htmlFor="reg-password" style={labelStyle}>Password</label>
            <div style={passwordWrapper}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 karakter"
                style={{ ...passwordInputStyle, paddingRight: '3rem' }}
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
            {loading ? 'Memproses…' : 'Buat Akun'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}
        >
          Sudah punya akun?{' '}
          <Link href="/auth/login" style={{ color: 'var(--color-sky-dark)', textDecoration: 'none', fontWeight: 500 }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
