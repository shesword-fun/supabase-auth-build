"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserStatus() {
  const [user, setUser] = useState<null | { email: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user && typeof data.user.email === "string" ? { email: data.user.email } : null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex gap-4">
        <Link href="/auth/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button>Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-700 dark:text-gray-200">
      Logged in as <span className="font-medium">{user.email}</span>
    </div>
  );
}
