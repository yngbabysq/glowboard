"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DangerZone({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (confirmation !== projectName) return;
    setLoading(true);
    const result = await deleteProject(projectId);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Project deleted");
      router.push("/dashboard/projects");
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Deleting a project permanently removes all its testimonials. This
          action cannot be undone.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="mt-4 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
            <Trash2 className="h-4 w-4" />
            Delete Project
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {projectName}?</DialogTitle>
              <DialogDescription>
                This will permanently delete the project and all its
                testimonials. Type <strong>{projectName}</strong> to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={projectName}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="cursor-pointer"
                disabled={confirmation !== projectName || loading}
                onClick={handleDelete}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete permanently
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
