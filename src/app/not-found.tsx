import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Page not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
