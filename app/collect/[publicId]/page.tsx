import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TestimonialForm } from "@/components/collect/TestimonialForm";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export async function generateMetadata(props: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await props.params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("public_id", publicId)
    .single();

  return {
    title: project ? `Share your experience — ${project.name}` : "Share your experience",
    description: "We'd love to hear your feedback. Leave a testimonial and help others discover us.",
  };
}

export default async function CollectPage(props: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await props.params;
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("name, public_id, logo_url, primary_color, thank_you_message")
    .eq("public_id", publicId)
    .single();

  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Project branding */}
        <div className="mb-8 text-center">
          {project.logo_url ? (
            <img
              src={project.logo_url}
              alt={project.name}
              className="mx-auto mb-3 h-12 w-auto"
            />
          ) : (
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: project.primary_color }}
            >
              <span className="text-lg font-bold text-white">
                {project.name[0]}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;d love to hear about your experience
          </p>
        </div>

        <TestimonialForm
          publicId={project.public_id}
          primaryColor={project.primary_color}
          thankYouMessage={project.thank_you_message}
        />
      </div>

      {/* Powered by */}
      <div className="mt-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        >
          <Sparkles className="h-3 w-3" />
          Powered by Glowboard
        </Link>
      </div>
    </div>
  );
}
