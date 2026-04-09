"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestimonialCard } from "./TestimonialCard";
import type { Testimonial } from "@/lib/supabase/database.types";

type Status = "all" | "pending" | "approved" | "rejected";

export function TestimonialList({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [tab, setTab] = useState<Status>("all");

  const filtered =
    tab === "all"
      ? testimonials
      : testimonials.filter((t) => t.status === tab);

  const counts = {
    all: testimonials.length,
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
      <TabsList>
        <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
        <TabsTrigger value="approved">
          Approved ({counts.approved})
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected ({counts.rejected})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={tab} className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-sm text-muted-foreground">
              {tab === "all"
                ? "No testimonials yet. Share your collection link to get started!"
                : `No ${tab} testimonials.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
