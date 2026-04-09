export const PLAN_LIMITS = {
  free: {
    maxProjects: 1,
    maxTestimonials: 15,
    widgetStyles: ["carousel", "grid", "wall"] as const,
    removeBranding: false,
    videoTestimonials: false,
    customColors: false,
    apiAccess: false,
    customDomain: false,
  },
  pro: {
    maxProjects: Infinity,
    maxTestimonials: Infinity,
    widgetStyles: ["carousel", "grid", "wall", "minimal"] as const,
    removeBranding: true,
    videoTestimonials: true,
    customColors: true,
    apiAccess: false,
    customDomain: false,
  },
  business: {
    maxProjects: Infinity,
    maxTestimonials: Infinity,
    widgetStyles: ["carousel", "grid", "wall", "minimal"] as const,
    removeBranding: true,
    videoTestimonials: true,
    customColors: true,
    apiAccess: true,
    customDomain: true,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  if (plan in PLAN_LIMITS) {
    return PLAN_LIMITS[plan as Plan];
  }
  return PLAN_LIMITS.free;
}
