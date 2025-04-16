"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type UserType = "visitor" | "merchant" | "admin";

export function UserTypeRadioGroup({
  value,
  onChange,
  className,
}: {
  value: UserType;
  onChange: (value: UserType) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="mb-1">User Type</Label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="user_type"
            value="visitor"
            checked={value === "visitor"}
            onChange={() => onChange("visitor")}
            className="accent-primary"
          />
          Visitor
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="user_type"
            value="merchant"
            checked={value === "merchant"}
            onChange={() => onChange("merchant")}
            className="accent-primary"
          />
          Merchant
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="user_type"
            value="admin"
            checked={value === "admin"}
            onChange={() => onChange("admin")}
            className="accent-primary"
          />
          Admin
        </label>
      </div>
    </div>
  );
}
