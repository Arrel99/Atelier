'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'
import Link from 'next/link'

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)

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
          .then(({ data: cp }) => setIsCreator(!!cp))
      }
    })
  }, [supabase])

  if (isAuthPage || isHomePage) return <>{children}</>

  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-lg">Atelier</Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">Dashboard</Link>
            {isCreator && (
              <Link href="/dashboard/slots" className="text-sm text-gray-500 hover:text-black">Slot</Link>
            )}
            <Link href="/creators" className="text-sm text-gray-500 hover:text-black">Kreator</Link>
          </div>
          <div className="flex items-center gap-4">
            {userId && <NotificationBell userId={userId} />}
            {!userId && (
              <Link href="/auth/login" className="text-sm px-4 py-2 bg-black text-white rounded-lg">Masuk</Link>
            )}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
