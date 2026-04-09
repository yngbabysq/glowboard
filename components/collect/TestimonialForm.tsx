"use client";

import { useState } from "react";
import { submitTestimonial } from "@/app/collect/[publicId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

export function TestimonialForm({
  publicId,
  primaryColor,
  thankYouMessage,
}: {
  publicId: string;
  primaryColor: string;
  thankYouMessage: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await submitTestimonial({
      customerName: name,
      customerEmail: email,
      rating,
      text,
      projectPublicId: publicId,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <CheckCircle2
              className="h-7 w-7"
              style={{ color: primaryColor }}
            />
          </div>
          <h2 className="text-lg font-semibold">{thankYouMessage}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your feedback helps us improve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com (optional)"
            />
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer p-0.5 transition-transform duration-100 hover:scale-110"
                >
                  <Star
                    className="h-7 w-7"
                    style={{
                      fill:
                        i <= (hoverRating || rating)
                          ? primaryColor
                          : "transparent",
                      color:
                        i <= (hoverRating || rating)
                          ? primaryColor
                          : "oklch(0.5 0 0)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Your testimonial <span className="text-destructive">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {text.length}/1000
              </span>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your experience..."
              required
              maxLength={1000}
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            style={{ backgroundColor: primaryColor }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Testimonial
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
