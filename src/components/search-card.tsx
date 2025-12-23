"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon, PlusIcon } from "lucide-react";
import type React from "react";

type SearchInfoProps = React.ComponentProps<"div"> & {
  icon: LucideIcon;
  label: string;
  value: string;
};

type SearchCardProps = React.ComponentProps<"div"> & {
  title?: string;
  description?: string;
  searchInfo?: SearchInfoProps[];
  formSectionClassName?: string;
};

export function SearchCard({
  title = "Search",
  description = "Type something to search or explore...",
  searchInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: SearchCardProps) {
  return (
    <div
      className={cn(
        "relative grid h-full w-full border bg-background md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      <PlusIcon
        className="-top-3 -left-3 absolute h-6 w-6 text-muted-foreground/50"
        strokeWidth={1}
      />
      <PlusIcon
        className="-top-3 -right-3 absolute h-6 w-6 text-muted-foreground/50"
        strokeWidth={1}
      />
      <PlusIcon
        className="-bottom-3 -left-3 absolute h-6 w-6 text-muted-foreground/50"
        strokeWidth={1}
      />
      <PlusIcon
        className="-bottom-3 -right-3 absolute h-6 w-6 text-muted-foreground/50"
        strokeWidth={1}
      />

      <div className="col-span-1 flex flex-col justify-between bg-secondary/20 lg:col-span-2 dark:bg-secondary/5">
        <div className="relative h-full space-y-6 px-6 py-10 md:p-12">
          <div className="space-y-4">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight">
              {title}
            </h1>
            <p className="max-w-xl text-muted-foreground text-base md:text-base lg:text-base leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {searchInfo?.map((info) => (
              <SearchInfo
                key={info.label}
                {...info}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Interaction/Form Area */}
      <div
        className={cn(
          "col-span-1 flex h-full w-full flex-col justify-center border-t bg-card px-6 py-10 md:border-t-0 md:border-l dark:bg-card/30",
          formSectionClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SearchInfo({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: SearchInfoProps) {
  return (
    <div
      className={cn("flex items-center gap-4 py-2", className)}
      {...props}
    >
      <div className="flex shrink-0 items-center justify-center rounded-xl border bg-background p-2.5 shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-muted-foreground text-xs md:text-sm truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
