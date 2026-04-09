import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureFirstProject } from "./projects/actions";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import type { Profile, Subscription } from "@/lib/supabase/database.types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await ensureFirstProject(user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const userProfile = (profile ?? {
    id: user.id,
    full_name: user.email ?? "",
    avatar_url: null,
    created_at: "",
    updated_at: "",
  }) satisfies Profile;

  const userSubscription = (subscription ?? {
    id: "",
    user_id: user.id,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan: "free" as const,
    status: "active" as const,
    current_period_end: null,
    created_at: "",
    updated_at: "",
  }) satisfies Subscription;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        profile={userProfile}
        subscription={userSubscription}
        email={user.email ?? ""}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav
          profile={userProfile}
          subscription={userSubscription}
          email={user.email ?? ""}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
