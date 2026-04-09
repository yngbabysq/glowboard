"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Code, Link2 } from "lucide-react";
import { toast } from "sonner";

export function EmbedCodeSection({
  embedScript,
  collectionUrl,
}: {
  embedScript: string;
  collectionUrl: string;
}) {
  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Embed &amp; Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embed Code */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Code className="h-4 w-4" />
            Embed Code
          </div>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              {embedScript}
            </pre>
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => copyToClipboard(embedScript, "Embed code")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste this into your website&apos;s HTML to display testimonials
          </p>
        </div>

        {/* Collection Link */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="h-4 w-4" />
            Collection Link
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">
              {collectionUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => copyToClipboard(collectionUrl, "Collection link")}
            >
              <Copy className="mr-1.5 h-3 w-3" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with customers to collect testimonials
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
