"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Menu,
  FolderKanban,
  CreditCard,
  LogOut,
} from "lucide-react";
import type { Profile, Subscription } from "@/lib/supabase/database.types";

const NAV_ITEMS = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/account", label: "Account", icon: CreditCard },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MobileNav({
  profile,
  subscription,
  email,
}: {
  profile: Profile;
  subscription: Subscription;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold tracking-tight">Glowboard</span>
      </div>

      <Sheet>
        <SheetTrigger className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Glowboard
            </SheetTitle>
          </SheetHeader>

          {/* User info */}
          <div className="flex items-center gap-3 border-b border-border px-2 pb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {getInitials(profile.full_name || email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="truncate text-sm font-medium">
                {profile.full_name || email}
              </p>
              <Badge
                variant="secondary"
                className="mt-0.5 px-1.5 py-0 text-[10px] uppercase"
              >
                {subscription.plan}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-border pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
