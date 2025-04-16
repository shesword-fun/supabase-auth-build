import { UserStatus } from '@/components/UserStatus';

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-center mb-4">Welcome to Supabase Auth Example</h1>
        <UserStatus />
      </div>
    </main>
  );
}
