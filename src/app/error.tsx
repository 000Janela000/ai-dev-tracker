"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="size-12 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
