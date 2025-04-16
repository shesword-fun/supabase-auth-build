import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { UserTypeDashboard } from '@/components/UserTypeDashboard'
import { createClient } from '@/lib/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 py-8">
      <div className="flex items-center gap-2">
        <p>
          Hello <span className="font-semibold">{data.user.email}</span>
        </p>
        <LogoutButton />
      </div>
      <div className="w-full max-w-sm">
        <UserTypeDashboard />
      </div>
    </div>
  )
}
