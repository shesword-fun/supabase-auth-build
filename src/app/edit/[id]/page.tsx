import { createClient as createSupabaseClient } from "@/lib/server";
import { notFound } from "next/navigation";
import { EditProfileForm } from "@/components/EditProfileForm";

export default async function EditProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createSupabaseClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
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
  const { data, error } = await supabase
    .from("users")
    .select("id, location, slug, profile_image_url")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  if (!currentUser || (currentUser.id !== data.id && currentUserType !== "admin")) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md w-full bg-white rounded shadow p-6 border flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">403 Forbidden</h1>
          <p className="text-gray-700 mb-4">You do not have permission to edit this profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white rounded shadow p-6 border">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        <EditProfileForm userId={data.id} initialLocation={data.location} initialSlug={data.slug} initialProfileImageUrl={data.profile_image_url} />
      </div>
    </main>
  );
}