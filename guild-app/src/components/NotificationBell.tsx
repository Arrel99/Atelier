'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/format'
import type { Notification } from '@/types'

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const unread = notifs.filter(n => !n.is_read).length

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { setNotifs(data || []) })

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifs(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Notifikasi</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                  Tandai semua dibaca
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 text-center">Tidak ada notifikasi</p>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className={`p-3 border-b text-sm ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
