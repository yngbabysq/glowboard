import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WidgetSettings } from "@/components/dashboard/WidgetSettings";
import { EmbedCodeSection } from "@/components/dashboard/EmbedCodeSection";
import { DangerZone } from "@/components/dashboard/DangerZone";

export default async function ProjectSettingsPage(props: {
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const collectionUrl = `${appUrl}/collect/${project.public_id}`;
  const embedScript = `<script src="${appUrl}/embed/widget.js" data-project="${project.public_id}"></script>`;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">{project.name}</p>
      </div>

      <WidgetSettings project={project} />
      <EmbedCodeSection
        embedScript={embedScript}
        collectionUrl={collectionUrl}
      />
      <DangerZone projectId={project.id} projectName={project.name} />
    </div>
  );
}
