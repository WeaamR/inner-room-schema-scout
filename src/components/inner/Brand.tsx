import { Link } from "@tanstack/react-router";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" dir="ltr" className={`font-brand text-lg tracking-[0.25em] text-foreground ${className}`}>
      THE <span className="text-amber">INNER</span> ROOM
    </Link>
  );
}
