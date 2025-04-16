"use client";

import { useEffect, useState } from "react";
import { UserTypeRadioGroup, UserType } from "@/components/ui/user-type-radio-group";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";

export function UserTypeDashboard() {
  const [userType, setUserType] = useState<UserType>("visitor"); // 'visitor', 'merchant', or 'admin'

  // Allowed user types
  const allowedUserTypes: UserType[] = ["visitor", "merchant", "admin"];
  const isValidUserType = (type: any): type is UserType => allowedUserTypes.includes(type);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchUserType = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Auth user:", user);
      if (userError || !user) {
        setError("Could not fetch user");
        setLoading(false);
        return;
      }
      // Fetch from users table
      const { data, error: dbError } = await supabase
        .from("users")
        .select("user_type")
        .eq("id", user.id)
        .single();
      console.log("DB result (fetch):", data, dbError);
      if (dbError || !data) {
        setError("Could not fetch user type. Please ensure your user exists and is logged in.");
      } else {
        if (!isValidUserType(data.user_type)) {
          setError(`Unexpected user_type: ${data.user_type}`);
        } else {
          setUserType(data.user_type);
        }
      }
      setLoading(false);
    };
    fetchUserType();
  }, []);

  const handleChange = async (newType: UserType) => {
    setUserType(newType);
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Auth user (update):", user);
    if (userError || !user) {
      setError("Could not update user type (no user)");
      setSaving(false);
      return;
    }
    // Validate with simple check
    if (!isValidUserType(newType)) {
      setError("Invalid user type selected.");
      setSaving(false);
      return;
    }
    const { error: dbError } = await supabase
      .from("users")
      .update({ user_type: newType })
      .eq("id", user.id);
    console.log("DB result (update):", dbError);
    if (dbError) {
      setError("Failed to update user type");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading user type...</div>;

  return (
    <div className="flex flex-col gap-2 items-start">
      <UserTypeRadioGroup value={userType} onChange={handleChange} />
      {saving && <span className="text-xs text-gray-500">Saving...</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
