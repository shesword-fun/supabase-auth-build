"use client";

import { useEffect, useState, useCallback } from "react";
import { UserTypeRadioGroup, UserType } from "@/components/ui/user-type-radio-group";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";

export function UserTypeDashboard() {
  const [userType, setUserType] = useState<UserType>("visitor"); // 'visitor', 'merchant', or 'admin'
  const [pendingType, setPendingType] = useState<UserType | null>(null);

  // Allowed user types
  const allowedUserTypes: UserType[] = ["visitor", "merchant", "admin"];
  const isValidUserType = useCallback(
    (type: unknown): type is UserType =>
      typeof type === "string" && allowedUserTypes.includes(type as UserType),
    [allowedUserTypes]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [allUsers, setAllUsers] = useState<{id: string; user_type: string}[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [rowSaving, setRowSaving] = useState<{[id: string]: boolean}>({});
  const [rowError, setRowError] = useState<{[id: string]: string | null}>({});
  const [rowAdminPasswords, setRowAdminPasswords] = useState<{[id: string]: string}>({});
  // Get admin password from env
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_USER_TYPE_PASSWORD || "";
  

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
          // If admin, fetch all users
          if (data.user_type === "admin") {
            setUsersLoading(true);
            const { data: usersData, error: usersError } = await supabase
              .from("users")
              .select("id, user_type");
            if (usersError) {
              setError("Failed to fetch users list");
              setAllUsers(null);
            } else {
              setAllUsers(usersData || []);
            }
            setUsersLoading(false);
          } else {
            setAllUsers(null);
          }
        }
      }
      setLoading(false);
    };
    fetchUserType();
  }, [isValidUserType]);

  const handleChange = (newType: UserType) => {
    setError(null);
    setPendingType(newType);
  };

  const handleSave = async () => {
    setError(null);
    if (pendingType === "admin") {
      if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
        setError("Invalid admin password");
        return;
      }
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Could not update user type (no user)");
      setSaving(false);
      return;
    }
    if (!isValidUserType(pendingType)) {
      setError("Invalid user type selected.");
      setSaving(false);
      return;
    }
    const { error: dbError } = await supabase
      .from("users")
      .update({ user_type: pendingType })
      .eq("id", user.id);
    if (dbError) {
      setError("Failed to update user type");
    } else {
      setUserType(pendingType);
      setPendingType(null);
      setAdminPassword("");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading user type...</div>;

  return (
    <div className="flex flex-col gap-2 items-start">
      <UserTypeRadioGroup value={pendingType ?? userType} onChange={handleChange} />
      {pendingType === 'admin' && (
        <div className="grid gap-2 mb-2">
          <input
            type="password"
            placeholder="Admin password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      )}
      {(pendingType !== null && pendingType !== userType) && (
        <Button onClick={handleSave} className="mb-2">Save</Button>
      )}
      {saving && <span className="text-xs text-gray-500">Saving...</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
      {/* Admin-only section */}
      {userType === "admin" && (
        <div className="mt-4 w-full">
          <div className="font-semibold mb-2">User Management (Admin Only)</div>
          {usersLoading ? (
            <div>Loading users...</div>
          ) : allUsers ? (
            <table className="min-w-full border rounded bg-gray-50 text-xs">
              <thead>
                <tr>
                  <th className="p-2 border-b text-left">User ID</th>
                  <th className="p-2 border-b text-left">User Type</th>
                  <th className="p-2 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="p-2 border-b break-all">{u.id}</td>
                    <td className="p-2 border-b">
                      <select
                        className="rounded border px-2 py-1 bg-white"
                        value={u.user_type}
                        disabled={rowSaving[u.id]}
                        onChange={async (e) => {
                          const newType = e.target.value as UserType;
                          setRowSaving((prev) => ({ ...prev, [u.id]: true }));
                          setRowError((prev) => ({ ...prev, [u.id]: null }));
                          // Require password for admin
                          if (newType === 'admin') {
                            if (!rowAdminPasswords[u.id] || rowAdminPasswords[u.id] !== ADMIN_PASSWORD) {
                              setRowError((prev) => ({ ...prev, [u.id]: "Invalid admin password" }));
                              setRowSaving((prev) => ({ ...prev, [u.id]: false }));
                              return;
                            }
                          }
                          const supabase = createClient();
                          const { error: updateError } = await supabase
                            .from("users")
                            .update({ user_type: newType })
                            .eq("id", u.id);
                          if (updateError) {
                            setRowError((prev) => ({ ...prev, [u.id]: "Failed to update" }));
                          } else {
                            setAllUsers((users) =>
                              users
                                ? users.map((user) =>
                                    user.id === u.id ? { ...user, user_type: newType } : user
                                  )
                                : users
                            );
                          }
                          setRowSaving((prev) => ({ ...prev, [u.id]: false }));
                        }}
                      >
                        <option value="admin">admin</option>
                        <option value="merchant">merchant</option>
                        <option value="visitor">visitor</option>
                      </select>
                    </td>
                    <td className="p-2 border-b">
                      {rowSaving[u.id] && <span className="text-gray-500">Saving...</span>}
                      {rowError[u.id] && <span className="text-red-500">{rowError[u.id]}</span>}
                    </td>
                    <td className="p-2 border-b">
                      {u.user_type !== 'admin' && (
                        <input
                          type="password"
                          placeholder="Admin password"
                          value={rowAdminPasswords[u.id] || ''}
                          onChange={e => setRowAdminPasswords(prev => ({ ...prev, [u.id]: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      )}
    </div>
  );
}
