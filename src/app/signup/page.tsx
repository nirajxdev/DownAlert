import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent-muted mx-auto mb-6">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Coming soon
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          DevPulse is not open for signups yet. We&apos;re building it right
          now. Check back soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-sm text-accent hover:text-accent-hover transition-colors"
        >
          <svg
            viewBox="0 0 16 16"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}
