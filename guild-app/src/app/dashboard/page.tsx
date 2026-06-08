import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, briefs(*)')
    .eq('creator_id', profile?.id ?? '')
    .order('created_at', { ascending: false })

  const { data: clientOrders } = await supabase
    .from('orders')
    .select('*, creator_profiles(display_name)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {profile && (
          <Link
            href="/dashboard/slots"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            Kelola Slot
          </Link>
        )}
      </div>

      <Dashboard
        profile={profile}
        orders={orders ?? []}
        clientOrders={clientOrders ?? []}
      />
    </div>
  )
}
