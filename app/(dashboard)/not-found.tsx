import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/dashboard/projects">
        <Button variant="outline" className="cursor-pointer">
          Back to Projects
        </Button>
      </Link>
    </div>
  );
}
