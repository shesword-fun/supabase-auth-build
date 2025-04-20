import { Navbar } from '@/components/Navbar';
import { MerchantGrid } from '@/components/MerchantGrid';
import { QueryProvider } from '@/components/QueryProvider';

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <QueryProvider>
          <MerchantGrid />
        </QueryProvider>
      </main>
    </>
  );
}
