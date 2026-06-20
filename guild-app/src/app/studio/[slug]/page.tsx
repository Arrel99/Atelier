import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface MemberBadge {
  id: string
  badge_type: string
}

interface MemberCreatorProfile {
  display_name: string
  bio: string
  category: string
  on_time_rate: number
  avatar_url: string | null
  reputation_badges?: MemberBadge[]
}

interface StudioMember {
  id: string
  role: string
  creator_profiles?: MemberCreatorProfile | null
}

interface StudioWithMembers {
  id: string
  name: string
  slug: string
  bio: string | null
  studio_members?: StudioMember[]
}

export default async function StudioPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: studio } = await supabase
    .from('studios')
    .select(`*, studio_members(role, creator_profiles(display_name, bio, category, on_time_rate, avatar_url, reputation_badges(badge_type)))`)
    .eq('slug', slug)
    .single()

  if (!studio) notFound()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{(studio as StudioWithMembers).name}</h1>
        <p className="text-gray-500">{(studio as StudioWithMembers).bio || 'Studio kreatif'}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Tim Kami</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {(studio as StudioWithMembers).studio_members?.map((member) => (
          <Link key={member.id} href={`/${member.creator_profiles?.display_name}`}
            className="p-4 border rounded-lg hover:shadow-md transition flex gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-lg">
              {member.creator_profiles?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{member.creator_profiles?.display_name}</h3>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100">{member.role}</span>
              </div>
              <p className="text-sm text-gray-500">{member.creator_profiles?.category}</p>
              <p className="text-xs text-gray-400 mt-1">Tepat Waktu: {member.creator_profiles?.on_time_rate}%</p>
              {member.creator_profiles?.reputation_badges && member.creator_profiles.reputation_badges.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {member.creator_profiles.reputation_badges.map((badge) => (
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
    </div>
  )
}
