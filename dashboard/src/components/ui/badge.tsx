import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses: Record<string, string> = {
  Pending: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
  InProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  AwaitingApproval: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  ReadyToRender: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  Failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
};

export function Badge({ className, status, ...props }: React.ComponentProps<"span"> & { status?: string }): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        status ? variantClasses[status] ?? "bg-zinc-100 text-zinc-800" : "bg-zinc-100 text-zinc-800",
        className
      )}
      {...props}
    />
  );
}
