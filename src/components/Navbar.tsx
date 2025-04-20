"use client";

import { UserStatus } from "@/components/UserStatus";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white">
            shesword.fun
          </Link>
          {/* Add more nav links here if needed */}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/user-type-dashboard">
            <Button variant="outline" size="sm">
              Change User Type
            </Button>
          </Link>
          <UserStatus />
        </div>
      </nav>
    </header>
  );
}
