"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function MarketingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <Button onClick={reset} variant="outline" className="cursor-pointer">
        Try again
      </Button>
    </div>
  );
}
