import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

interface CreatorBadge {
  id: string
  badge_type: string
}

interface CreatorUser {
  full_name: string
  avatar_url: string | null
}

interface CreatorItem {
  id: string
  display_name: string
  bio: string | null
  category: string
  is_verified: boolean
  on_time_rate: number
  repeat_client_rate: number
  users: CreatorUser | null
  reputation_badges?: CreatorBadge[]
}

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase
    .from('creator_profiles')
    .select(`*, users!inner(full_name, avatar_url), reputation_badges(badge_type)`)
    .eq('is_verified', true)
    .order('on_time_rate', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Direktori Kreator</h1>

      {!creators || creators.length === 0 ? (
        <p className="text-gray-400">Belum ada kreator terverifikasi.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(creators as CreatorItem[]).map((creator) => (
            <Link key={creator.id} href={`/${creator.display_name}`}
              className="p-4 border rounded-lg hover:shadow-md transition flex gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-xl">
                {creator.users?.avatar_url ? (
                  <Image src={creator.users.avatar_url} alt="" width={64} height={64} className="w-full h-full rounded-full object-cover" unoptimized />
                ) : creator.display_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{creator.display_name}</h2>
                  {creator.is_verified && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Verified</span>}
                </div>
                <p className="text-sm text-gray-500 truncate">{creator.bio || creator.category}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>Tepat Waktu: {creator.on_time_rate}%</span>
                  <span>Klien Setia: {creator.repeat_client_rate}%</span>
                </div>
                {creator.reputation_badges && creator.reputation_badges.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {creator.reputation_badges.map((badge) => (
                      <span key={badge.id} className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                        {badge.badge_type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
