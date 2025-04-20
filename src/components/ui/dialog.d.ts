import * as React from "react";

export interface DialogProps extends React.ComponentPropsWithRef<"div"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export declare function Dialog(props: DialogProps): React.ReactElement | null;

export interface DialogContentProps extends React.ComponentPropsWithRef<"div"> {
  children: React.ReactNode;
  className?: string;
}

export declare function DialogContent(props: DialogContentProps): React.ReactElement;
