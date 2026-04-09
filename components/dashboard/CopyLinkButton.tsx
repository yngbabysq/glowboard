"use client";

import { toast } from "sonner";

export function CopyLinkButton({ url }: { url: string }) {
  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer truncate text-left underline-offset-2 transition-colors hover:text-foreground hover:underline"
    >
      {url}
    </button>
  );
}
