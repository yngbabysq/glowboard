import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialList } from "@/components/dashboard/TestimonialList";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { Link2, Settings } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!project) notFound();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const collectionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collect/${project.public_id}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            <CopyLinkButton url={collectionUrl} />
          </div>
        </div>
        <Link
          href={`/dashboard/projects/${project.id}/settings`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {/* Testimonials */}
      <TestimonialList testimonials={testimonials ?? []} />
    </div>
  );
}
