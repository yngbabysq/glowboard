import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountContent } from "@/components/dashboard/AccountContent";

export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!subscription) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      <AccountContent subscription={subscription} />
    </div>
  );
}
