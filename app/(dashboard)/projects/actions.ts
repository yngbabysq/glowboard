"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  updateProjectSettingsSchema,
} from "@/lib/validations/project";
import { getPlanLimits } from "@/lib/utils/plan-limits";

export async function ensureFirstProject(userId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count === 0) {
    await supabase.from("projects").insert({
      user_id: userId,
      name: "My First Project",
      public_id: nanoid(12),
    });
  }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check plan limit
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  const limits = getPlanLimits(subscription?.plan ?? "free");
  if (limits.maxProjects !== Infinity) {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= limits.maxProjects) {
      return { error: `Your plan is limited to ${limits.maxProjects} project${limits.maxProjects === 1 ? "" : "s"}. Upgrade for more.` };
    }
  }

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name: parsed.data.name,
    public_id: nanoid(12),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function approveTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function rejectTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function updateProjectSettings(
  projectId: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = updateProjectSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/projects");
  return { success: true };
}
