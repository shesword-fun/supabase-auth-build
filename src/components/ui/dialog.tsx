import * as React from "react";
import { cn } from "@/lib/utils";

export interface DialogProps extends React.ComponentPropsWithRef<"div"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative z-10 w-full max-w-2xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export interface DialogContentProps extends React.ComponentPropsWithRef<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className, ...props }: DialogContentProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl shadow-xl border p-6 animate-scaleIn",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Animations (add to global CSS if not present):
// .animate-fadeIn { animation: fadeIn 0.2s; }
// .animate-scaleIn { animation: scaleIn 0.18s; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
