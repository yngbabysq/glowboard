"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  FolderKanban,
  CreditCard,
  LogOut,
  ChevronUp,
  ArrowUpCircle,
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

export function Sidebar({
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
    <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold tracking-tight">Glowboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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

      {/* Upgrade prompt */}
      {subscription.plan === "free" && (
        <div className="mx-3 mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade to Pro
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlimited projects &amp; testimonials
          </p>
          <Link href="/dashboard/account">
            <Button
              size="sm"
              className="mt-2 w-full cursor-pointer"
            >
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(profile.full_name || email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium">
                  {profile.full_name || email}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] uppercase"
                  >
                    {subscription.plan}
                  </Badge>
                </div>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
