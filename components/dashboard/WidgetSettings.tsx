"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectSettings } from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/lib/supabase/database.types";

const WIDGET_STYLES = [
  { value: "carousel", label: "Carousel", desc: "Sliding cards with arrows" },
  { value: "grid", label: "Grid", desc: "2-3 column grid layout" },
  { value: "wall", label: "Wall", desc: "Masonry-style columns" },
  { value: "minimal", label: "Minimal", desc: "Simple vertical list" },
] as const;

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
];

export function WidgetSettings({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [style, setStyle] = useState(project.widget_style);
  const [color, setColor] = useState(project.primary_color);
  const [thankYou, setThankYou] = useState(project.thank_you_message);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    const result = await updateProjectSettings(project.id, {
      name,
      widget_style: style,
      primary_color: color,
      thank_you_message: thankYou,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Widget Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Widget Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Widget Style</label>
          <div className="grid grid-cols-2 gap-2">
            {WIDGET_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-colors duration-150 ${
                  style === s.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-transform duration-150 ${
                  color === c ? "scale-110 border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-24 text-xs"
              placeholder="#6366f1"
            />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Thank You Message</label>
          <Textarea
            value={thankYou}
            onChange={(e) => setThankYou(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Shown after a customer submits a testimonial
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="cursor-pointer"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
