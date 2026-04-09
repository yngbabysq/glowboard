import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Get testimonial counts per project
  const projectsWithCounts = await Promise.all(
    (projects ?? []).map(async (project) => {
      const { count: totalCount } = await supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      const { count: pendingCount } = await supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id)
        .eq("status", "pending");

      return {
        ...project,
        testimonial_count: totalCount ?? 0,
        pending_count: pendingCount ?? 0,
      };
    })
  );

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user!.id)
    .single();

  const plan = subscription?.plan ?? "free";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your testimonial collection projects
          </p>
        </div>
        <CreateProjectDialog plan={plan} />
      </div>

      {projectsWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start collecting testimonials
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithCounts.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
