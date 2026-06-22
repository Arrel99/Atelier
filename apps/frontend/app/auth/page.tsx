"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"

export default function AuthPage() {
  // "login" atau "daftar" — default tampil login dulu
  const [mode, setMode] = useState<"login" | "daftar">("login")

  return (
    <main className="min-h-screen bg-[#a8b4c0] flex items-center justify-center px-4">
      {mode === "login" ? (
        <LoginForm onSwitchToDaftar={() => setMode("daftar")} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setMode("login")} />
      )}
    </main>
  )
}