import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageWrapper({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "px-12 py-8 overflow-auto scrollbar h-full mx-auto",
        className
      )}
      {...props}
    />
  );
}
