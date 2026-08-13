import Link from "next/link";

export function LogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-heading text-white">
        <LogoIcon />
      </div>
      <span className="font-semibold text-base tracking-tight text-heading">
        DownAlert
      </span>
    </Link>
  );
}
