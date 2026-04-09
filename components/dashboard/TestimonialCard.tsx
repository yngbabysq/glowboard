"use client";

import { useRouter } from "next/navigation";
import {
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
} from "@/app/(dashboard)/projects/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import type { Testimonial } from "@/lib/supabase/database.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  approved: "bg-green-500/10 text-green-600 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const router = useRouter();

  async function handleApprove() {
    const result = await approveTestimonial(testimonial.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Testimonial approved");
      router.refresh();
    }
  }

  async function handleReject() {
    const result = await rejectTestimonial(testimonial.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Testimonial rejected");
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteTestimonial(testimonial.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Testimonial deleted");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent className="flex gap-4 pt-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={testimonial.customer_avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {getInitials(testimonial.customer_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">
                {testimonial.customer_name}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                {/* Stars */}
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(testimonial.created_at)}
                </span>
              </div>
            </div>
            <Badge className={STATUS_STYLES[testimonial.status]}>
              {testimonial.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{testimonial.text}</p>

          {/* Actions */}
          <div className="flex gap-1 pt-1">
            {testimonial.status !== "approved" && (
              <Button
                variant="ghost"
                size="xs"
                className="cursor-pointer text-green-600 hover:text-green-700"
                onClick={handleApprove}
              >
                <Check className="mr-1 h-3 w-3" />
                Approve
              </Button>
            )}
            {testimonial.status !== "rejected" && (
              <Button
                variant="ghost"
                size="xs"
                className="cursor-pointer text-yellow-600 hover:text-yellow-700"
                onClick={handleReject}
              >
                <X className="mr-1 h-3 w-3" />
                Reject
              </Button>
            )}
            <Button
              variant="ghost"
              size="xs"
              className="cursor-pointer text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
