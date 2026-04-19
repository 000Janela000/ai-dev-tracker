import Link from "next/link";
import { format } from "date-fns";

function issueNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface MastheadProps {
  /** Optional active section label for the nav underline */
  section?: "briefing" | "digest" | "saved" | "read-later";
}

/**
 * Publication-style masthead. Dashboard-only. Turns a CRUD app into a
 * recognizable daily edition — date, issue number, tagline, thin rule.
 */
export function Masthead({ section = "briefing" }: MastheadProps) {
  const now = new Date();
  const dateLabel = format(now, "EEEE, MMMM d, yyyy");
  const issue = issueNumber(now);

  return (
    <header className="mx-auto max-w-3xl px-4 pt-10 pb-8 sm:pt-14">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <time dateTime={now.toISOString()}>{dateLabel}</time>
        <span>Issue №{issue}</span>
      </div>

      <h1 className="display mt-2 font-serif text-5xl font-normal text-foreground sm:text-[72px]">
        DevNews
      </h1>

      <p className="mt-2 font-serif text-sm italic text-muted-foreground sm:text-base">
        A daily briefing of AI developments for people who build software.
      </p>

      <div className="masthead-rule mt-6" />

      <nav className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
        <MastheadLink
          href="/dashboard"
          active={section === "briefing"}
          label="Today's briefing"
        />
        <MastheadLink
          href="/digest"
          active={section === "digest"}
          label="Weekly digest"
        />
        <MastheadLink
          href="/saved"
          active={section === "saved"}
          label="Saved"
        />
        <MastheadLink
          href="/read-later"
          active={section === "read-later"}
          label="Read later"
        />
      </nav>
    </header>
  );
}

function MastheadLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "text-foreground underline decoration-accent decoration-[1.5px] underline-offset-[6px]"
          : "text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}
