import { createClient as createSupabaseClient } from "@/lib/server";
import { notFound } from "next/navigation";

// This must be a server component
export default async function MerchantProfilePage(props: { params: Promise<{ location: string; slug: string }> }) {
  const { location, slug } = await props.params;
  const supabase = await createSupabaseClient();

  // Get current authenticated user
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch the merchant with the given location and slug
  const { data, error } = await supabase
    .from("users")
    .select("id, user_type, last_seen, location, slug")
    .eq("location", location)
    .eq("slug", slug)
    .single();

  // Fetch current user's user_type
  let currentUserType = null;
  if (currentUser) {
    const { data: userRow } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", currentUser.id)
      .single();
    currentUserType = userRow?.user_type;
  }

  // If not found or not a merchant, show 404
  if (error || !data || data.user_type !== "merchant") {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white rounded shadow p-6 border">
        <h1 className="text-2xl font-bold mb-2">Merchant Profile</h1>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Location:</span> {data.location}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Slug:</span> {data.slug}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Last Login:</span> {data.last_seen ? new Date(data.last_seen).toLocaleString() : "Never"}
        </div>
        {(currentUser && (currentUser.id === data.id || currentUserType === "admin")) && (
          <div className="mt-4 flex justify-end">
            <Link href={`/edit/${data.id}`}>
              <Button variant="outline">Edit</Button>
            </Link>
          </div>
        )
      }
      </div>
      {/* Comments section */}
      <div className="flex flex-col items-center w-full">

        <MerchantComments merchantId={data.id} />
      </div>
    </main>
  );
}

import { MerchantComments } from "@/components/MerchantComments";
import Link from "next/link";
import { Button } from "@/components/ui/button";
