import { createClient as createSupabaseClient } from "@/lib/server";
import { notFound } from "next/navigation";
import { EditProfileForm } from "@/components/EditProfileForm";

// Server component for /edit/[slug]
export default async function EditMerchantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) notFound();

  // Get user_type from users table (fallback to user_metadata)
  let currentUserType: string | null = null;
  const { data: userRow } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", currentUser.id)
    .single();
  currentUserType = userRow?.user_type || currentUser.user_metadata?.user_type || null;

  // Fetch merchant by slug
  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !merchant) notFound();

  // Access logic
  const isAdmin = currentUserType === "admin";
  const isOwner = currentUserType === "merchant" && merchant.id && currentUser.id === merchant.id;
  if (!isAdmin && !isOwner) notFound();

  // Pass all merchant data to the form
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <EditProfileForm merchant={merchant} />
    </div>
  );
}
