"use client"

import { useRouter } from "next/navigation"

type LoginFormProps = {
  onSwitchToDaftar: () => void
}

export default function LoginForm({ onSwitchToDaftar }: LoginFormProps) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
      {/* Tab indicator */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200 pb-3">
        <span className="text-sm font-semibold text-text-dark border-b-2 border-text-dark pb-1">
          Masuk
        </span>
        <span
          className="text-sm text-text-muted cursor-pointer hover:text-text-dark"
          onClick={onSwitchToDaftar}
        >
          Daftar
        </span>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Email / Username
          </label>
          <input
            type="text"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Kata Sandi
          </label>
          <input
            type="password"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tombol login */}
      <button
        onClick={() => router.push("/")}
        className="mt-8 w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Login
      </button>

      {/* Switch ke daftar */}
      <p className="text-center mt-3">
        <span
          className="text-sm text-text-muted underline cursor-pointer hover:text-primary"
          onClick={onSwitchToDaftar}
        >
          Daftar
        </span>
      </p>

      <p className="text-center mt-6 text-base font-bold text-text-dark tracking-widest">
        ATELIER
      </p>
    </div>
  )
}