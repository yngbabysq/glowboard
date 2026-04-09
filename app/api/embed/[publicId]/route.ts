import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  const supabase = createAdminClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id, primary_color, widget_style")
    .eq("public_id", publicId)
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select(
      "id, customer_name, customer_avatar_url, rating, text, created_at"
    )
    .eq("project_id", project.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Check if branding should be shown (free plan)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", project.user_id)
    .single();

  const showBranding = subscription?.plan === "free";

  return NextResponse.json(
    {
      testimonials: testimonials ?? [],
      style: project.widget_style,
      primaryColor: project.primary_color,
      showBranding,
    },
    { headers: CORS_HEADERS }
  );
}
