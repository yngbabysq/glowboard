"use server";

import { createTestimonialSchema } from "@/lib/validations/testimonial";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanLimits } from "@/lib/utils/plan-limits";

export async function submitTestimonial(data: {
  customerName: string;
  customerEmail: string;
  rating: number;
  text: string;
  projectPublicId: string;
}) {
  const parsed = createTestimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();

  // Find project by public_id
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("public_id", parsed.data.projectPublicId)
    .single();

  if (projectError || !project) {
    return { error: "Project not found" };
  }

  // Check testimonial limit for free plan
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", project.user_id)
    .single();

  const limits = getPlanLimits(subscription?.plan ?? "free");
  if (limits.maxTestimonials !== Infinity) {
    const { count } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id);

    if ((count ?? 0) >= limits.maxTestimonials) {
      return { error: "This project has reached its testimonial limit." };
    }
  }

  const { error: insertError } = await supabase
    .from("testimonials")
    .insert({
      project_id: project.id,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail || null,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: "pending",
    });

  if (insertError) {
    return { error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
