'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'client' | 'creator'>('client')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/auth/login?registered=true')
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Daftar</h1>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Daftar sebagai</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'client' | 'creator')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="client">Klien</option>
            <option value="creator">Kreator</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Daftar
        </button>

        <p className="text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-black dark:text-white underline">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  )
}
