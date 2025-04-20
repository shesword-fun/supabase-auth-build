import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { BatchUploadConsole } from './BatchUploadConsole'

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/auth/sign-in');
  }
  // Fetch user_type from users table
  const { data: userRow, error: userTypeError } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', data.user.id)
    .single();

  if (userTypeError || userRow?.user_type !== 'admin') {
    redirect('/auth/sign-in');
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg rounded-xl border bg-background p-8 shadow">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
        <p className="mt-4 text-center text-muted-foreground">Welcome, admin!</p>
        {/* Batch upload component for manifest.json */}
        <BatchUploadConsole />
      </div>
    </main>
  );
}


