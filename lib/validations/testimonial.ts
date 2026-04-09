import { z } from "zod/v4";

export const createTestimonialSchema = z.object({
  customerName: z.string().min(1, "Name is required").max(100),
  customerEmail: z.string().email().optional().or(z.literal("")),
  rating: z.number().int().min(1, "Please select a rating").max(5),
  text: z.string().min(1, "Please write your testimonial").max(1000),
  projectPublicId: z.string().min(1),
});
