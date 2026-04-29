"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  email: string;
  displayName?: string | null;
}

export function UserMenu({ email, displayName }: Props) {
  // Prefer first name from full display name; fall back to email local-part.
  const triggerLabel =
    (displayName && displayName.trim().split(/\s+/)[0]) ||
    (email.split("@")[0]) ||
    "Account";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]" aria-label="Open account menu">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="px-2 py-1.5">
          {displayName && (
            <div className="truncate text-sm font-medium">{displayName}</div>
          )}
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        </div>
        <div className="my-1 h-px bg-border" />
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary"
        >
          <User className="h-4 w-4" /> Dashboard
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
