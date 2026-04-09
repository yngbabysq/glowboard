"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock } from "lucide-react";
import type { Project } from "@/lib/supabase/database.types";

type ProjectWithCounts = Project & {
  testimonial_count: number;
  pending_count: number;
};

export function ProjectCard({ project }: { project: ProjectWithCounts }) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-colors duration-150 hover:bg-accent/50"
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project.primary_color }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {project.testimonial_count}
          </span>
          {project.pending_count > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 px-1.5 py-0 text-[10px]"
            >
              <Clock className="h-3 w-3" />
              {project.pending_count} pending
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
