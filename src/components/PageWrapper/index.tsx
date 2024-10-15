import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageWrapper({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "px-6 py-6 overflow-auto scrollbar h-full mx-auto",
        className
      )}
      {...props}
    />
  );
}
