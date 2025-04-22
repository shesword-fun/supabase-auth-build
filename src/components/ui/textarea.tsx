import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  minRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, minRows = 2, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="font-semibold mb-1">{label}</label>}
      <textarea
        ref={ref}
        rows={minRows}
        className="border rounded px-2 py-1 w-full min-h-[2.5rem]"
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";
